import * as fs from "fs";
import * as path from "path";

import {
  AbilitiesText,
  DefaultText,
  ItemsText,
  MovesText,
} from "pokebedrock-showdown";

type AnyObject<V = unknown> = { [key: string]: V };

type TypeMap = { [key: string | Lowercase<string>]: any };

const showdownTextSources: { key: string; map: TypeMap }[] = [
  { key: "abilities", map: AbilitiesText },
  { key: "default", map: DefaultText },
  { key: "items", map: ItemsText },
  { key: "moves", map: MovesText },
];

const SHOWDOWN_PREFIX = "showdown.";
const SHOWDOWN_HEADER = "### Showdown Battle Text";
const EN_US_LANG_PATH = path.join("texts", "en_US.lang");

const keyMaps: string[] = [];

/**
 * Resolves a reference value from the original object.
 * @param originalObj - The original object.
 * @param referenceKey - The reference key.
 * @param keyPath - The key path.
 * @returns The resolved value.
 */
function resolveReferenceValue(
  originalObj: TypeMap,
  referenceKey: string,
  keyPath: string
): string | null {
  const isRelativeDefaultRef = referenceKey.startsWith(".");
  if (isRelativeDefaultRef) {
    const defaultSection = (DefaultText as AnyObject)["default"] as
      | AnyObject
      | undefined;

    if (!defaultSection) {
      console.error(
        `DefaultText.default not found while resolving reference '${referenceKey}' for '${keyPath}'`
      );
      return null;
    }

    const value = defaultSection[referenceKey.slice(1)];

    if (typeof value !== "string") {
      console.error(
        `Reference '${referenceKey}' for '${keyPath}' did not resolve to a string`
      );
      return null;
    }

    return value;
  }

  const fromOriginal = (originalObj as AnyObject)[referenceKey];

  if (fromOriginal && typeof fromOriginal === "object") {
    return null;
  }

  if (typeof fromOriginal === "string") {
    return fromOriginal;
  }

  const fromOtherSource = Object.values(showdownTextSources)
    .map((source) => source.map)
    .find((map) => referenceKey in (map as AnyObject)) as AnyObject | undefined;

  if (!fromOtherSource) {
    console.error(
      `Reference key '${referenceKey}' not found while resolving '${keyPath}'`
    );
    return null;
  }

  const propertyName = keyPath.split(".").pop();
  if (!propertyName) {
    console.error(
      `Property name not found while resolving reference '${referenceKey}' for '${keyPath}'`
    );
    return null;
  }
  const value = fromOtherSource[referenceKey]?.[propertyName];

  if (typeof value !== "string") {
    console.error(
      `Reference '${referenceKey}' for '${keyPath}' did not resolve to a string`
    );
    return null;
  }

  return value;
}

/**
 * Maps keys to values.
 * @param originalObj - The original object.
 * @param obj - The object to map.
 * @param parentKeyList - The parent key list.
 */
function mapKeysToValues(
  originalObj: TypeMap,
  obj: TypeMap | AnyObject<string>,
  parentKeyList: string[] = []
) {
  for (const [key, rawValue] of Object.entries(obj)) {
    const keyPath = `${[...parentKeyList, key].join(".")}`;
    if (typeof rawValue === "object" && rawValue !== null) {
      if (/^gen\d+$/i.test(key)) {
        continue;
      }

      mapKeysToValues(originalObj, rawValue as TypeMap, [
        ...parentKeyList,
        key,
      ]);
      continue;
    }

    if (typeof rawValue !== "string") {
      console.error("Invalid value type found for", keyPath);
      continue;
    }

    let value = rawValue;
    if (value.startsWith("#")) {
      const referenceKey = value.slice(1);
      const resolved = resolveReferenceValue(
        originalObj,
        referenceKey,
        keyPath
      );
      if (resolved == null) continue;
      value = resolved;
    }

    value = value.replace(/\[(.*?)\]/g, "%s");

    const flattenedValue = value.replace(/(\r\n|\n|\r)/gm, " ").trim();
    keyMaps.push(`${keyPath}=${flattenedValue}`);
  }
}

/**
 * Builds the showdown key map.
 */
function buildShowdownKeyMap() {
  keyMaps.length = 0;

  for (const { key, map } of showdownTextSources) {
    mapKeysToValues(map, map, [SHOWDOWN_PREFIX.slice(0, -1), key]);
  }
}

/**
 * Updates the en_US.lang file.
 */
function updateEnUsLangFile() {
  const langPath = EN_US_LANG_PATH;
  if (!fs.existsSync(langPath)) {
    throw new Error(`Could not find lang file at '${langPath}'`);
  }

  const originalContent = fs.readFileSync(langPath, "utf8");
  const lines = originalContent.split(/\r?\n/);
  const headerIndex = lines.findIndex(
    (line) => line.trim() === SHOWDOWN_HEADER
  );
  const nonShowdownLines = lines.filter(
    (line) => !line.trim().startsWith(SHOWDOWN_PREFIX)
  );

  if (headerIndex === -1) {
    const updated = [
      ...nonShowdownLines,
      "",
      SHOWDOWN_HEADER,
      "",
      ...keyMaps,
    ].join("\n");

    fs.writeFileSync(langPath, updated, "utf8");
    return;
  }

  const nonShowdownHeaderIndex = nonShowdownLines.findIndex(
    (line) => line.trim() === SHOWDOWN_HEADER
  );

  const beforeHeader = nonShowdownLines.slice(0, nonShowdownHeaderIndex + 1);
  const afterHeader = nonShowdownLines.slice(nonShowdownHeaderIndex + 1);
  const updatedLines = [...beforeHeader, "", ...keyMaps, ...afterHeader];

  fs.writeFileSync(langPath, updatedLines.join("\n"), "utf8");
}

async function main() {
  buildShowdownKeyMap();
  updateEnUsLangFile();
}

void main();
