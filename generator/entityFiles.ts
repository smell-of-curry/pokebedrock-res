import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import type {
  AnimationFile,
  EntityFile,
  GeometryFile,
  PokemonJsonContent,
} from "./types";
import { Logger } from "./utils";

// Set up the Logger
const logDirectory = process.cwd(); // You can change this to another directory if needed
Logger.setLogDirectory(logDirectory);

// Paths and Variables
const pokemonJsonPath = path.join(process.cwd(), "pokemon.json");
const pokemonEntityFileTemplatePath = path.join("generator", "templates", "pokemon.entity.json");
const pokemonSubstituteEntityFileTemplatePath = path.join("generator", "templates", "pokemonSubstitute.entity.json");
const pokemonEntityFilesDir = path.join("entity", "pokemon");
const markdownLogPath = path.join(process.cwd(), "missing_info.md");

// Initialize directories
fsExtra.ensureDirSync(pokemonEntityFilesDir);
fsExtra.emptyDirSync(pokemonEntityFilesDir);

// Markdown file content
let markdownContent = `# Missing Information Report\n\n## Summary\nThis report contains details about missing or problematic elements found during the Pokémon processing.\n\n`;

// Read and parse the Pokemon JSON content
const pokemonJson: PokemonJsonContent = JSON.parse(fs.readFileSync(pokemonJsonPath, "utf8"));

// Read the templates
const pokemonEntityFileTemplate: EntityFile = JSON.parse(fs.readFileSync(pokemonEntityFileTemplatePath, "utf8"));
const pokemonSubstituteEntityFileTemplate: EntityFile = JSON.parse(fs.readFileSync(pokemonSubstituteEntityFileTemplatePath, "utf8"));

/**
 * Checks if a valid geometry file exists for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @returns `true` if the geometry file is valid, `false` otherwise.
 */
function hasValidGeometryFile(pokemonTypeId: string): boolean {
  const filePath = path.join("models", "entity", "pokemon", `${pokemonTypeId}.geo.json`);
  if (!fs.existsSync(filePath)) {
    markdownContent += `## Missing Geometry File\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: No geometry file found for Pokémon type ${pokemonTypeId}.\n\n`;
    return false;
  }

  const geometryFile: GeometryFile = fsExtra.readJSONSync(filePath);
  const valid = geometryFile["minecraft:geometry"].some(
    (g) => g.description.identifier === `geometry.${pokemonTypeId}`
  );

  if (!valid) {
    markdownContent += `## Invalid Geometry File\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: The geometry file for Pokémon type ${pokemonTypeId} is invalid.\n\n`;
  }

  return valid;
}

/**
 * Retrieves defined animations for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @returns An array of animation names, or `undefined` if no animations are found.
 */
function getDefinedAnimations(pokemonTypeId: string): string[] | undefined {
  const filePath = path.join("animations", "pokemon", `${pokemonTypeId}.animation.json`);
  if (!fs.existsSync(filePath)) {
    markdownContent += `## Missing Animation File\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: No animation file found for Pokémon type ${pokemonTypeId}.\n\n`;
    return undefined;
  }

  try {
    const animationFile: AnimationFile = fsExtra.readJSONSync(filePath);
    return Object.keys(animationFile.animations)
      .map((a) => a.split(".")[2] ?? "INVALID_ANIMATION_NAME")
      .filter((a) => a !== "INVALID_ANIMATION_NAME");
  } catch (error) {
    markdownContent += `## Error Reading Animation File\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: Error occurred while reading animation file for Pokémon type ${pokemonTypeId}.\n\n`;
    return undefined;
  }
}

/**
 * Updates the entity file with missing animations based on the Pokemon's behavior.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @param entityFile - The entity file to update.
 * @param animations - The list of defined animations.
 */
function updateEntityFileWithAnimations(
  pokemonTypeId: string,
  entityFile: EntityFile,
  animations: string[]
) {
  const entityDescription = entityFile["minecraft:client_entity"].description;
  const defaultAnimation = `animation.${pokemonTypeId}.ground_idle`;

  const requiredAnimations: Record<string, string> = {
    flying: `animation.${pokemonTypeId}.flying`,
    air_idle: `animation.${pokemonTypeId}.air_idle`,
    swimming: `animation.${pokemonTypeId}.swimming`,
    water_idle: `animation.${pokemonTypeId}.water_idle`,
    walking: `animation.${pokemonTypeId}.walking`,
    sleeping: `animation.${pokemonTypeId}.sleeping`,
  };

  const behavior = pokemonJson.pokemon[pokemonTypeId].behavior as {
    canMove: boolean;
    canWalk: boolean;
    canSwim: boolean;
    canFly: boolean;
    canLook: boolean;
    canSleep: boolean;
  };

  Object.entries(requiredAnimations).forEach(([behaviorKey, animationKey]) => {
    const behaviorProperty = `can${capitalize(behaviorKey)}` as keyof typeof behavior;
    if (behavior[behaviorProperty] && !animations.includes(behaviorKey)) {
      markdownContent += `## Missing Animation\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Animation Type**: ${behaviorKey}\n- **Description**: Animation ${behaviorKey} is missing for Pokémon type ${pokemonTypeId}.\n\n`;
      entityDescription.animations[animationKey] = defaultAnimation;
    }
  });
}

/**
 * Verifies and updates textures for the given Pokemon type.
 * @param pokemonTypeId - The ID of the Pokemon type.
 * @param entityFile - The entity file to update.
 */
function verifyAndUpdateTextures(pokemonTypeId: string, entityFile: EntityFile) {
  const textureDir = path.join("textures", "entity", "pokemon", pokemonTypeId);
  const textures = fs.readdirSync(textureDir);

  if (!textures.includes(`${pokemonTypeId}.png`)) {
    markdownContent += `## Missing Default Texture\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: No default texture found for Pokémon type ${pokemonTypeId}.\n\n`;
  }
  if (!textures.includes(`shiny_${pokemonTypeId}.png`)) {
    markdownContent += `## Missing Shiny Texture\n\n- **Pokémon Type ID**: ${pokemonTypeId}\n- **Description**: No shiny texture found for Pokémon type ${pokemonTypeId}.\n\n`;
    const defaultTexturePath = `textures/entity/pokemon/${pokemonTypeId}/${pokemonTypeId}.png`;
    const entityTextures = entityFile["minecraft:client_entity"].description.textures;
    entityTextures["shiny"] = defaultTexturePath;
    entityTextures["shiny_male"] = defaultTexturePath;
    entityTextures["shiny_female"] = defaultTexturePath;
    entityFile["minecraft:client_entity"].description.textures = entityTextures;
  }
}

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main function to process all Pokemon and generate entity files.
 */
function processPokemon() {
  Logger.info("Starting Pokémon processing...");

  for (const pokemonTypeId in pokemonJson.pokemon) {
    const pokemon = pokemonJson.pokemon[pokemonTypeId];
    if (!pokemon) continue; // should not happen but just in case

    const hasModel = pokemonJson.pokemonWithModels.includes(pokemonTypeId);
    let templateFile = hasModel
      ? pokemonEntityFileTemplate
      : pokemonSubstituteEntityFileTemplate;

    let newTemplate = JSON.stringify(templateFile, null, 2).replace(/\{speciesId\}/g, pokemonTypeId);
    let entityFile: EntityFile = JSON.parse(newTemplate);

    if (hasModel) {
      if (!hasValidGeometryFile(pokemonTypeId)) {
        Logger.error(`Pokemon ${pokemonTypeId} has no valid geometry file.`);
      }

      const animations = getDefinedAnimations(pokemonTypeId);
      if (animations) {
        updateEntityFileWithAnimations(pokemonTypeId, entityFile, animations);
      } else {
        Logger.error(`Pokemon ${pokemonTypeId} has no defined animations.`);
      }

      verifyAndUpdateTextures(pokemonTypeId, entityFile);
    }

    fs.writeFileSync(
      path.join(pokemonEntityFilesDir, `${pokemonTypeId}.entity.json`),
      JSON.stringify(entityFile, null, 2)
    );

    Logger.info(`Processed Pokémon ${pokemonTypeId}`);
  }

  Logger.info("Pokémon processing completed.");

  // Write the markdown content to the file
  fs.writeFileSync(markdownLogPath, markdownContent);
  Logger.info(`Markdown report generated at ${markdownLogPath}`);
}

processPokemon();
