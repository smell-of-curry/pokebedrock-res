import fs from "fs";
import path from "path";
import os from "os";
import fsExtra from "fs-extra";
import https from "https";
import { execSync } from "child_process";
import { Logger, safeReadJSON } from "./utils";
import { PokemonJsonContent, PokemonTypeId } from "./types";
import { writeJsonFileSync } from "write-json-file";

/**
 * Responsibilities:
 * - Scrape the Showdown cries listing
 * - Filter to Pokémon present in pokemon.json (including hyphenated forms mapping)
 * - Skip cries that already exist in ./sounds/mob/pokemon as .ogg
 * - Prefer .ogg sources; otherwise download .mp3 and convert to .ogg
 * - Update sounds/sound_definitions.json and sounds.json to ensure ambient/death entries exist for every Pokémon id present
 */

const CWD = process.cwd();
const POKEMON_JSON_PATH = path.join(CWD, "pokemon.json");
const CRY_DIR = path.join(CWD, "sounds", "mob", "pokemon");
const SOUND_DEFS_PATH = path.join(CWD, "sounds", "sound_definitions.json");
const SOUNDS_JSON_PATH = path.join(CWD, "sounds.json");
const SHOWDOWN_CRY_LIST_URL = "https://play.pokemonshowdown.com/audio/cries/";

type ShowdownCry = {
  baseName: string; // e.g., "lycanroc-midnight" or "machamp"
  ogg: boolean;
  mp3: boolean;
};

/**
 * Fetches the contents of a URL and returns it as a string.
 * @param url
 * @returns
 */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          // handle redirect
          return resolve(
            fetchUrl(new URL(res.headers.location, url).toString())
          );
        }
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Request failed. Status code: ${res.statusCode}`)
          );
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

/**
 * Parses the Showdown cry listing HTML and returns a list of ShowdownCry objects.
 * @param html
 * @returns
 */
function parseShowdownListing(html: string): ShowdownCry[] {
  // The directory listing contains links to files like <a href="machamp.ogg">machamp.ogg</a>
  const hrefRegex = /href=\"([^\"]+)\"/g;
  const fileMap = new Map<string, { ogg: boolean; mp3: boolean }>();
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html))) {
    const href = match[1];
    if (!href) continue;
    if (!/\.(ogg|mp3)$/i.test(href)) continue;
    const ext = href.toLowerCase().endsWith(".ogg") ? "ogg" : "mp3";
    const base = href.replace(/\.(ogg|mp3)$/i, "").toLowerCase();
    const current = fileMap.get(base) || { ogg: false, mp3: false };
    current[ext as "ogg" | "mp3"] = true;
    fileMap.set(base, current);
  }
  return [...fileMap.entries()].map(([baseName, v]) => ({
    baseName: baseName.replace(/^\.\//, ""),
    ogg: v.ogg,
    mp3: v.mp3,
  }));
}

/**
 * Normalizes a Pokémon key for Showdown.
 * @param baseName
 * @returns
 */
function normalizePokemonKeyFromShowdown(baseName: string): string {
  // pokemon.json keys are lowercased alphanumeric without hyphens for most forms.
  // Convert showdown hyphenated names to our internal representation where appropriate.
  // Examples:
  //  lycanroc-midnight -> lycanrocmidnight
  //  wishiwashi-solo -> wishiwashisolo
  //  mr-mime -> mrmime, mime-jr -> mimejr, mr-rime -> mrrime
  //  nidoran-f -> nidoranf, nidoran-m -> nidoranm

  let key = baseName.toLowerCase();
  key = key.replace(/[-_]/g, "");
  return key;
}

function showdownNameForPath(baseName: string): string {
  // Keep the original for constructing URL path; the remote uses hyphens
  return baseName;
}

async function getShowdownCries(): Promise<ShowdownCry[]> {
  const html = await fetchUrl(SHOWDOWN_CRY_LIST_URL);
  return parseShowdownListing(html);
}

function ensureDirs() {
  fsExtra.ensureDirSync(CRY_DIR);
}

function listLocalOggs(): Set<string> {
  const set = new Set<string>();
  if (!fs.existsSync(CRY_DIR)) return set;
  for (const f of fs.readdirSync(CRY_DIR)) {
    if (f.toLowerCase().endsWith(".ogg")) set.add(f.toLowerCase());
  }
  return set;
}

async function downloadToBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const nextUrl = new URL(res.headers.location, url).toString();
          return resolve(downloadToBuffer(nextUrl));
        }
        if (res.statusCode !== 200)
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.from(c)));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function convertMp3BufferToOgg(mp3Buffer: Buffer): Buffer {
  // Use ffmpeg if available on system. We'll write to a temp file then read back the ogg.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pokeb-"));
  const inPath = path.join(tmpDir, "in.mp3");
  const outPath = path.join(tmpDir, "out.ogg");
  fs.writeFileSync(inPath, mp3Buffer);
  try {
    execSync(
      `ffmpeg -loglevel error -y -i "${inPath}" -c:a libvorbis -q:a 5 "${outPath}"`
    );
    const result = fs.readFileSync(outPath);
    return result;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

function readJson<T>(p: string): T {
  const json = safeReadJSON<T>(p);
  if (!json) throw new Error(`Failed to read ${p}`);
  return json;
}

type SoundDefinitions = Record<string, any>;

/**
 * Lists the base names of the local ogg files.
 * @returns
 */
function listLocalOggBaseNames(): Set<string> {
  const set = new Set<string>();
  if (!fs.existsSync(CRY_DIR)) return set;
  for (const f of fs.readdirSync(CRY_DIR)) {
    if (!f.toLowerCase().endsWith(".ogg")) continue;
    const base = f.slice(0, -4).toLowerCase();
    set.add(base);
  }
  return set;
}

/**
 * Resolves the base key for a given species key.
 * @param speciesKey
 * @param baseNames
 * @example "dudunsparcethreesegment" -> "dudunsparce"
 * @returns
 */
function resolveCryBaseKey(
  speciesKey: string,
  baseNames: Set<string>
): string | null {
  // direct match
  if (baseNames.has(speciesKey)) return speciesKey;
  // fallback: find longest prefix that exists as a cry
  for (let i = speciesKey.length - 1; i > 0; i--) {
    const candidate = speciesKey.slice(0, i);
    if (baseNames.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Upserts the sound definitions for a given pokemon key.
 *
 * @param soundDefs
 * @param pokemonKeys
 * @param cryBaseNames
 */
function upsertSoundDefinitions(
  soundDefs: SoundDefinitions,
  pokemonKeys: string[]
) {
  const cryBaseNames = listLocalOggBaseNames();
  for (const key of pokemonKeys) {
    const ambientId = `mob.${key}.ambient`;
    const deathId = `mob.${key}.death`;
    const resolved = resolveCryBaseKey(key, cryBaseNames);
    if (!resolved)
      throw new Error(
        `Missing sound for pokemon '${key}' (no form or base cry found)`
      );
    if (resolved !== key) {
      Logger.warn(`Ambiguous sound for pokemon '${key}' (using ${resolved})`);
    }
    soundDefs[ambientId] = {
      category: "neutral",
      sounds: [`sounds/mob/pokemon/${resolved}`],
    };
    soundDefs[deathId] = {
      category: "neutral",
      sounds: [`sounds/mob/pokemon/${resolved}`],
    };
  }
}

type SoundsJson = {
  entity_sounds: {
    entities: Record<string, any>;
  };
};

/**
 * Upserts the sounds json for a given pokemon key.
 *
 * @param soundsJson
 * @param pokemonKeys
 */
function upsertSoundsJson(soundsJson: SoundsJson, pokemonKeys: string[]) {
  for (const key of pokemonKeys) {
    const namespaced = `pokemon:${key}`;
    const existing = soundsJson.entity_sounds.entities[namespaced];
    const volume = existing?.volume ?? 3;
    const pitch = existing?.pitch ?? [0.5, 1.2];
    soundsJson.entity_sounds.entities[namespaced] = {
      volume,
      pitch,
      events: {
        ambient: `mob.${key}.ambient`,
        death: `mob.${key}.death`,
      },
    };
  }
}

async function main() {
  ensureDirs();

  // Load pokemon.json
  const pokemonJson = readJson<PokemonJsonContent>(POKEMON_JSON_PATH);
  const pokemonKeys = Object.keys(pokemonJson.pokemon) as PokemonTypeId[];
  const pokemonSet = new Set<string>(pokemonKeys);

  // Crawl showdown list
  Logger.info("Fetching Showdown cries listing...");
  const remote = await getShowdownCries();
  Logger.info(`Found ${remote.length} cry base names on remote.`);

  // Build mapping of remote baseName -> our key if applicable
  const eligible: {
    baseName: string;
    ourKey: string;
    source: "ogg" | "mp3";
  }[] = [];
  for (const entry of remote) {
    const ourKey = normalizePokemonKeyFromShowdown(entry.baseName);
    if (!pokemonSet.has(ourKey)) continue;
    if (entry.ogg)
      eligible.push({ baseName: entry.baseName, ourKey, source: "ogg" });
    else if (entry.mp3)
      eligible.push({ baseName: entry.baseName, ourKey, source: "mp3" });
  }

  // Skip ones already present locally
  const localOggs = listLocalOggs();
  const toDownload = eligible.filter((e) => !localOggs.has(`${e.ourKey}.ogg`));
  Logger.info(
    `Eligible matching cries: ${eligible.length}. Missing locally: ${toDownload.length}.`
  );

  // Download and write
  for (const item of toDownload) {
    try {
      const remoteFile = `${SHOWDOWN_CRY_LIST_URL}${showdownNameForPath(
        item.baseName
      )}.${item.source}`;
      Logger.info(`Downloading ${remoteFile}`);
      const buf = await downloadToBuffer(remoteFile);
      let oggBuffer: Buffer;
      if (item.source === "ogg") {
        oggBuffer = buf;
      } else {
        Logger.info(`Converting ${item.baseName}.mp3 -> ${item.ourKey}.ogg`);
        oggBuffer = convertMp3BufferToOgg(buf);
      }
      const outPath = path.join(CRY_DIR, `${item.ourKey}.ogg`);
      fs.writeFileSync(outPath, oggBuffer);
    } catch (err) {
      Logger.error(`Failed processing ${item.baseName}: ${err}`);
    }
  }

  // Update sound_definitions.json
  Logger.info("Updating sound_definitions.json...");
  const soundDefs = readJson<SoundDefinitions>(SOUND_DEFS_PATH);
  upsertSoundDefinitions(soundDefs, pokemonKeys);
  writeJsonFileSync(SOUND_DEFS_PATH, soundDefs, { detectIndent: true });

  // Update sounds.json
  Logger.info("Updating sounds.json...");
  const soundsJson = readJson<SoundsJson>(SOUNDS_JSON_PATH);
  if (!soundsJson.entity_sounds || !soundsJson.entity_sounds.entities) {
    throw new Error("sounds.json missing entity_sounds.entities structure");
  }
  upsertSoundsJson(soundsJson, pokemonKeys);
  writeJsonFileSync(SOUNDS_JSON_PATH, soundsJson, { detectIndent: true });

  Logger.info("Done generating Pokémon cries and syncing sound definitions.");
}

main().catch((e) => {
  Logger.error(String(e));
  process.exit(1);
});
