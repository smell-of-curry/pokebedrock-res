import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import sharp from "sharp";
import * as commentJson from "comment-json";
import type {
  AnimationFile,
  EntityFile,
  GeometryFile,
  ItemTextureFile,
  PokemonJsonContent,
  RenderControllerFile,
} from "./types";
import { Logger } from "./utils";
import { ANIMATED_TEXTURED_POKEMON } from "./data/animatedTextures";

Logger.setLogDirectory(path.join(process.cwd(), "logs"));

const pokemonJsonPath = path.join(process.cwd(), "pokemon.json");
const templatesPath = path.join(process.cwd(), "scripts", "templates");
const pokemonEntityTemplatePath = path.join(
  templatesPath,
  "pokemon.entity.json"
);
const pokemonSubstituteEntityTemplatePath = path.join(
  templatesPath,
  "pokemonSubstitute.entity.json"
);
const pokemonRCTemplatePath = path.join(templatesPath, "pokemon.rc.json");
const pokemonEntityFilesDir = path.join(process.cwd(), "entity", "pokemon");
const markdownLogPath = path.join(process.cwd(), "missing_info.md");
const renderControllersPath = path.join(
  process.cwd(),
  "render_controllers",
  "pokemon"
);

fsExtra.ensureDirSync(pokemonEntityFilesDir);
fsExtra.ensureDirSync(renderControllersPath);
fsExtra.emptyDirSync(pokemonEntityFilesDir);
fsExtra.emptyDirSync(renderControllersPath);

const pokemonJson: PokemonJsonContent = fsExtra.readJSONSync(pokemonJsonPath);
const pokemonEntityFileTemplate: EntityFile = fsExtra.readJSONSync(
  pokemonEntityTemplatePath
);
const pokemonSubstituteEntityFileTemplate: EntityFile = fsExtra.readJSONSync(
  pokemonSubstituteEntityTemplatePath
);
const pokemonRCTemplate: RenderControllerFile = fsExtra.readJSONSync(
  pokemonRCTemplatePath
);

/**
 * Maps a pokemon's typeId to an array of missing animations
 * @example bulbasaur -> ["walking", "swimming"]
 */
const missingPokemonAnimations = new Map<string, string[]>();
/**
 * Maps a pokemon's typeId to an array of missing textures
 * @example bulbasaur -> ["bulbasaur.png", "shiny_bulbasaur.png"]
 */
const missingPokemonTextures = new Map<string, string[]>();
/**
 * Holds a list of pokemon typeId's that have invalid animation names
 */
const hasInvalidAnimationNames = new Set<string>();
const hasInvalidAnimationFiles = new Set<string>();
/**
 * Holds a list of pokemon typeId's that are missing a geometry file
 * @example ["bulbasaur", "charmander"]
 */
const missingGeometryFiles = new Set<string>();
const invalidGeometryFiles = new Set<string>();
const missingAnimationFiles = new Set<string>();
/**
 * Holds a list of pokemon typeId's that are missing a sprite
 */
const missingSprites = new Set<string>();

/**
 * Checks if a valid geometry file exists for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @returns `true` if the geometry file is valid, `false` otherwise.
 */
function hasValidGeometryFile(pokemonTypeId: string): boolean {
  const filePath = path.join(
    "models",
    "entity",
    "pokemon",
    `${pokemonTypeId}.geo.json`
  );
  if (!fs.existsSync(filePath)) {
    missingGeometryFiles.add(pokemonTypeId);
    return false;
  }

  const geometryFile: GeometryFile = fsExtra.readJSONSync(filePath);
  const valid = geometryFile["minecraft:geometry"].some(
    (g) => g.description.identifier === `geometry.${pokemonTypeId}`
  );
  if (!valid) {
    invalidGeometryFiles.add(pokemonTypeId);
    return false;
  }
  return valid;
}

/**
 * Retrieves defined animations for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @returns An array of animation names, or `undefined` if no animations are found.
 */
function getDefinedAnimations(pokemonTypeId: string): string[] | undefined {
  const filePath = path.join(
    "animations",
    "pokemon",
    `${pokemonTypeId}.animation.json`
  );
  if (!fs.existsSync(filePath)) {
    missingAnimationFiles.add(pokemonTypeId);
    return undefined;
  }

  try {
    const animationFile: AnimationFile = fsExtra.readJSONSync(filePath);
    const animationNames = Object.keys(animationFile.animations).map(
      (a) => a.split(".")[2] ?? "INVALID_ANIMATION_NAME"
    );
    for (const animationName of animationNames) {
      if (animationName != "INVALID_ANIMATION_NAME") continue;
      hasInvalidAnimationNames.add(pokemonTypeId);
    }
    return animationNames.filter((a) => a != "INVALID_ANIMATION_NAME");
  } catch (error) {
    // Most likely there is a comment inside the JSON file.
    hasInvalidAnimationFiles.add(pokemonTypeId);
    return undefined;
  }
}

/**
 * Updates the entity file with missing animations based on the Pokemon's behavior.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @param entityFile - The entity file to update.
 * @param animations - The list of defined animations.
 * @returns the updated entity file
 */
function updateEntityFileWithAnimations(
  pokemonTypeId: string,
  entityFile: EntityFile,
  animations: string[]
): EntityFile {
  const entityDescription = entityFile["minecraft:client_entity"].description;
  const defaultAnimation = `animation.${pokemonTypeId}.ground_idle`;
  const behavior = pokemonJson.pokemon[pokemonTypeId].behavior;

  const requirementMap: { [key: string]: keyof typeof behavior | null } = {
    flying: "canFly",
    air_idle: "canFly",
    swimming: "canSwim",
    water_idle: "canSwim",
    walking: "canWalk",
    ground_idle: null,
    sleeping: "canSleep",
    blink: "canLook",
  };

  Object.entries(requirementMap).forEach(([behaviorKey, requirement]) => {
    if (!requirement) return;
    if (behavior[requirement] && animations.includes(behaviorKey)) return;

    const missingAnimations = missingPokemonAnimations.get(pokemonTypeId) ?? [];
    missingAnimations.push(behaviorKey);
    missingPokemonAnimations.set(pokemonTypeId, missingAnimations);

    if (behaviorKey != "blink")
      entityDescription.animations[behaviorKey] = defaultAnimation;
  });

  if (pokemonTypeId in ANIMATED_TEXTURED_POKEMON) {
    entityFile["minecraft:client_entity"].description.materials["default"] =
      "custom_animated"; // Apply UV Animation to the entity.
  }

  entityFile["minecraft:client_entity"].description = entityDescription;
  return entityFile;
}

/**
 * Verifies and updates textures for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @param entityFile - The entity file to update.
 * @returns the updated entity file
 */
function verifyAndUpdateTextures(
  pokemonTypeId: string,
  skins: string[],
  entityFile: EntityFile
): EntityFile {
  const textureDir = path.join("textures", "entity", "pokemon", pokemonTypeId);
  const textures = fs.readdirSync(textureDir);
  const defaultTexturePath = path
    .join(textureDir, `${pokemonTypeId}.png`)
    .replace(/\\/g, "/");
  const entityTextures =
    entityFile["minecraft:client_entity"].description.textures;

  const missingTextures = missingPokemonTextures.get(pokemonTypeId) ?? [];
  if (!textures.includes(`${pokemonTypeId}.png`)) {
    missingTextures.push(`${pokemonTypeId}.png`);
    return entityFile; // not good!
  }

  if (!textures.includes(`shiny_${pokemonTypeId}.png`)) {
    missingTextures.push(`shiny_${pokemonTypeId}.png`);

    entityTextures["shiny"] = defaultTexturePath;
    entityTextures["shiny_male"] = defaultTexturePath;
    entityTextures["shiny_female"] = defaultTexturePath;
  }

  for (const skinId of skins) {
    const skinFileName = `${pokemonTypeId}_${skinId}.png`;
    if (textures.includes(skinFileName)) {
      entityTextures[skinId] = path
        .join(textureDir, skinFileName)
        .replace(/\\/g, "/");
      continue;
    } else {
      missingTextures.push(skinFileName);
      entityTextures[skinId] = defaultTexturePath;
    }
  }

  if (missingTextures.length > 0)
    missingPokemonTextures.set(pokemonTypeId, missingTextures);

  entityFile["minecraft:client_entity"].description.textures = entityTextures;
  return entityFile;
}

/**
 * Creates a render controller for the specified Pokémon type.
 * @param pokemonTypeId - The ID of the Pokémon type.
 * @param skins - An array of skin texture identifiers.
 */
function makeRenderController(pokemonTypeId: string, skins: string[]): void {
  const templateString = JSON.stringify(pokemonRCTemplate, null, 2).replace(
    /\{speciesId\}/g,
    pokemonTypeId
  );

  const textureCheckMolang = fs
    .readFileSync(path.join(templatesPath, "textureCheck.molang"), "utf-8")
    .replace(/\s+/g, "");

  const updatedTemplate = templateString.replace(
    `\'./textureCheck.molang\'`,
    textureCheckMolang
  );
  const rcFile: RenderControllerFile = JSON.parse(updatedTemplate);

  const renderer =
    rcFile.render_controllers[`controller.render.pokemon:${pokemonTypeId}`];
  const textures = renderer.arrays.textures["Array.variants"] as string[];

  for (const skin of skins) {
    textures.push(`Texture.${skin}`);
  }

  (renderer.arrays.textures["Array.variants"] as string[]) = textures;
  if (pokemonTypeId in ANIMATED_TEXTURED_POKEMON) {
    const [frameCount, fps] = ANIMATED_TEXTURED_POKEMON[pokemonTypeId];
    renderer["uv_anim"] = {
      offset: [
        0.0,
        `math.mod(math.floor(q.life_time * ${fps}), ${frameCount}) / ${frameCount}`,
      ],
      scale: [1.0, `1.0 / ${frameCount}`],
    };
  }
  rcFile.render_controllers[`controller.render.pokemon:${pokemonTypeId}`] =
    renderer;

  fsExtra.writeJSONSync(
    path.join(renderControllersPath, `${pokemonTypeId}.rc.json`),
    rcFile,
    {
      spaces: 2,
    }
  );
}

/**
 * Checks if this pokemon has a sprite matching its typeId in `textures/sprites/default`.
 * This will also generate a darkened sprite in `textures/sprites/dark` if it doesn't exist.
 * Then will ensure the item texture exists in `textures/item_texture.json`.
 *
 * @param pokemonTypeId
 */
async function checkAndEnsureSprite(pokemonTypeId: string) {
  const spriteDir = path.join("textures", "sprites", "default");
  const darkSpriteDir = path.join("textures", "sprites", "dark");

  const spritePath = path.join(spriteDir, `${pokemonTypeId}.png`);
  const darkSpritePath = path.join(darkSpriteDir, `${pokemonTypeId}.png`);
  const itemTexturesPath = path.join("textures", "item_texture.json");

  if (!fs.existsSync(spritePath)) {
    Logger.error(`Missing sprite for ${pokemonTypeId} in ${spritePath}`);
    missingSprites.add(pokemonTypeId);
    return;
  }

  if (!fs.existsSync(darkSpritePath)) {
    Logger.info(`Generating dark sprite for ${pokemonTypeId}...`);
    try {
      // Load the image
      const image = sharp(spritePath);

      // Get the metadata (like dimensions) to properly manipulate pixels
      const { width, height } = await image.metadata();

      // Extract the raw pixel data
      const rawImageData = await image.raw().toBuffer();

      // Modify the pixel values to make them pitch dark
      for (let i = 0; i < rawImageData.length; i += 4) {
        // Set RGB values to near-zero, keeping the alpha channel intact
        rawImageData[i] = 10; // Red
        rawImageData[i + 1] = 10; // Green
        rawImageData[i + 2] = 10; // Blue
      }

      // Create a new image with the modified pixel data
      await sharp(rawImageData, {
        raw: { width: width!, height: height!, channels: 4 },
      }).toFile(darkSpritePath);

      Logger.info(`Dark sprite generated for ${pokemonTypeId}!`);
    } catch (error) {
      Logger.error(`Error processing the image: ${error}`);
    }
  }

  const itemTextures: ItemTextureFile = fsExtra.readJSONSync(itemTexturesPath);
  itemTextures.texture_data[pokemonTypeId] = {
    textures: spritePath.replace(/\\/g, "/"),
  };
  fsExtra.writeJSONSync(itemTexturesPath, itemTextures, {
    spaces: 2,
  });
}

/**
 * Main function to process all Pokemon and generate entity files.
 */
async function processPokemon() {
  Logger.info("Starting Pokémon processing...");

  for (const pokemonTypeId in pokemonJson.pokemon) {
    const pokemon = pokemonJson.pokemon[pokemonTypeId];
    if (!pokemon) continue;

    const hasModel = pokemonJson.pokemonWithModels.includes(pokemonTypeId);
    let templateFile = hasModel
      ? pokemonEntityFileTemplate
      : pokemonSubstituteEntityFileTemplate;

    let newTemplate = JSON.stringify(templateFile, null, 2).replace(
      /\{speciesId\}/g,
      pokemonTypeId
    );
    let entityFile: EntityFile = JSON.parse(newTemplate);

    if (hasModel) {
      if (!hasValidGeometryFile(pokemonTypeId)) {
        Logger.error(`Pokemon ${pokemonTypeId} has no valid geometry file.`);
      }

      const animations = getDefinedAnimations(pokemonTypeId);
      if (animations) {
        entityFile = updateEntityFileWithAnimations(
          pokemonTypeId,
          entityFile,
          animations
        );
      } else {
        Logger.error(`Pokemon ${pokemonTypeId} has no defined animations.`);
      }

      entityFile = verifyAndUpdateTextures(
        pokemonTypeId,
        pokemon.skins,
        entityFile
      );
    }

    if (pokemon.skins.length > 0) {
      makeRenderController(pokemonTypeId, pokemon.skins);
    } else if (hasModel) {
      // Use the default render controller for Pokémon without skins
      entityFile["minecraft:client_entity"].description.render_controllers[0] =
        {
          "controller.render.pokemon": "query.variant==0",
        };
    }

    fsExtra.writeJSONSync(
      path.join(pokemonEntityFilesDir, `${pokemonTypeId}.entity.json`),
      entityFile,
      {
        spaces: 2,
      }
    );

    makeRenderController(pokemonTypeId, pokemon.skins);
    await checkAndEnsureSprite(pokemonTypeId);

    Logger.info(`Processed Pokémon ${pokemonTypeId}`);
  }

  Logger.info("Pokémon processing completed.");

  // Write the markdown content to the file
  let markdownContent = `# Missing Information Report\n\nThis report contains details about missing or problematic elements found during the Pokémon processing.\n\n`;
  markdownContent += `## Pokemon Missing Geometry Files\n`;
  if (missingGeometryFiles.size > 0) {
    missingGeometryFiles.forEach((pokemonTypeId) => {
      markdownContent += `- ${pokemonTypeId}\n`;
    });
  } else {
    markdownContent += "No pokemon missing geometry files found!\n";
  }
  markdownContent += `\n## Pokemon With Invalid Geometry Files\n`;
  if (invalidGeometryFiles.size > 0) {
    invalidGeometryFiles.forEach((pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](models/entity/pokemon/${pokemonTypeId}.geo.json)\n`;
    });
  } else {
    markdownContent += "No pokemon have invalid geometry files!\n";
  }
  markdownContent += `\n## Pokemon With Missing Animation Files\n`;
  if (missingAnimationFiles.size > 0) {
    missingAnimationFiles.forEach((pokemonTypeId) => {
      markdownContent += `- ${pokemonTypeId}\n`;
    });
  } else {
    markdownContent += "No pokemon are missing animation files!\n";
  }
  markdownContent += `\n## Missing Pokemon Textures\n`;
  if (missingPokemonTextures.size > 0) {
    missingPokemonTextures.forEach((textures, pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](textures/entity/pokemon/${pokemonTypeId}/): ${textures.join(
        ", "
      )}\n`;
    });
  } else {
    markdownContent += "No pokemon have missing textures!\n";
  }
  markdownContent += `\n## Missing Pokemon Sprite Textures\n`;
  if (missingSprites.size > 0) {
    missingSprites.forEach((pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](textures/sprites/default/${pokemonTypeId})\n`;
    });
  } else {
    markdownContent += "No pokemon have missing sprite textures!\n";
  }
  markdownContent += `\n## Pokemon that Have Invalid Animation Names\n`;
  if (hasInvalidAnimationNames.size > 0) {
    hasInvalidAnimationNames.forEach((pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](animations/pokemon/${pokemonTypeId}.animation.json)\n`;
    });
  } else {
    markdownContent += "No Pokemon have invalid animation names!\n";
  }
  markdownContent += `\n## Pokemon With Invalid Animation Files\n`;
  if (hasInvalidAnimationFiles.size > 0) {
    hasInvalidAnimationFiles.forEach((pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](animations/pokemon/${pokemonTypeId}.animation.json)\n`;
    });
  } else {
    markdownContent += "No pokemon have invalid animation files!\n";
  }
  markdownContent += `\n## Missing Pokemon Animations\n`;
  markdownContent += `\n> [!NOTE]`;
  markdownContent += `\n> Some of these could be a result of missing [behavior sets](https://github.com/pokebedrock/pokemonComponents).\n\n`;
  if (missingPokemonAnimations.size > 0) {
    missingPokemonAnimations.forEach((animations, pokemonTypeId) => {
      markdownContent += `- [${pokemonTypeId}](animations/pokemon/${pokemonTypeId}.animation.json): ${animations.join(
        ", "
      )}\n`;
    });
  } else {
    markdownContent += "No missing Pokemon animations found.\n";
  }

  fs.writeFileSync(markdownLogPath, markdownContent);
  Logger.info(`Markdown report generated at ${markdownLogPath}`);
}

processPokemon();
