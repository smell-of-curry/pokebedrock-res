import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import type {
  AnimationFile,
  EntityFile,
  GeometryFile,
  PokemonJsonContent,
} from "./types";
import { Debugger } from "./utils";

/**
 * All Pokemon in this addon.
 */
const pokemonJson: PokemonJsonContent = JSON.parse(
  fs.readFileSync("pokemon.json", "utf8")
);

const pokemonEntityFileTemplate: EntityFile = JSON.parse(
  fs.readFileSync("generator/templates/pokemon.entity.json", "utf8")
);
const pokemonSubstituteEntityFileTemplate: EntityFile = JSON.parse(
  fs.readFileSync("generator/templates/pokemonSubstitute.entity.json", "utf8")
);

const pokemonEntityFilesDir = path.join("entity/pokemon");
fsExtra.ensureDirSync(pokemonEntityFilesDir);
fsExtra.emptyDirSync(pokemonEntityFilesDir);

/**
 * If this pokemon has a valid geometry file.
 * @param pokemonTypeId
 * @returns
 */
function hasValidGeometryFile(pokemonTypeId: string): boolean {
  const filePath = path.join(
    "models",
    "entity",
    "pokemon",
    pokemonTypeId + ".geo.json"
  );
  if (!fs.existsSync(filePath)) return false;
  // Check identifier
  const geometryFile: GeometryFile = fsExtra.readJSONSync(filePath);
  const hasValidIdentifier = geometryFile["minecraft:geometry"].find(
    (g) => g.description.identifier === `geometry.${pokemonTypeId}`
  );
  if (hasValidIdentifier) return true;
  return false;
}

/**
 * Gets this pokemon's defined animations as present in the matching animation file.
 * @param pokemonTypeId
 * @returns Defined animations or undefined if no animation file found.
 */
function getDefinedAnimations(pokemonTypeId: string): string[] | undefined {
  const filePath = path.join(
    "animations",
    "pokemon",
    pokemonTypeId + ".animation.json"
  );
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const animationFile: AnimationFile = fsExtra.readJSONSync(filePath);
    const animationNames = Object.keys(animationFile.animations).map(
      (a) => a.split(".")[2] ?? "INVALID_ANIMATION_NAME"
    );
    return animationNames.filter((a) => a !== "INVALID_ANIMATION_NAME");
  } catch (error) {
    Debugger.error(`Error reading animation file for ${pokemonTypeId}`);
    return undefined;
  }
}

for (const pokemonTypeId in pokemonJson.pokemon) {
  const pokemon = pokemonJson.pokemon[pokemonTypeId];
  if (!pokemon) continue; // should not happen but just in case

  const hasModel = pokemonJson.pokemonWithModels.includes(pokemonTypeId);
  let templateFile = hasModel
    ? pokemonEntityFileTemplate
    : pokemonSubstituteEntityFileTemplate;
  let newTemplate = JSON.stringify(templateFile, null, 2);
  newTemplate = newTemplate.replace(/\{speciesId\}/g, pokemonTypeId);
  let entityFile: EntityFile = JSON.parse(newTemplate);

  if (hasModel) {
    // Verify Pokemon Geometry
    if (!hasValidGeometryFile(pokemonTypeId)) {
      Debugger.error(`Pokemon ${pokemonTypeId} has no valid geometry file.`);
    }
    // Verify Pokemon Animations
    const animations = getDefinedAnimations(pokemonTypeId);
    if (!animations) {
      Debugger.error(`Pokemon ${pokemonTypeId} has no defined animations.`);
    } else {
      if (!animations.includes("ground_idle")) {
        Debugger.error(
          `Pokemon ${pokemonTypeId} has no 'ground_idle' animation!`
        );
      }
      if (pokemon.behavior.canFly && !animations.includes("flying")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can fly but has no 'flying' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.flying`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
      if (pokemon.behavior.canFly && !animations.includes("air_idle")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can fly but has no 'air_idle' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.air_idle`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
      if (pokemon.behavior.canSwim && !animations.includes("swimming")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can swim but has no 'swimming' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.swimming`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
      if (pokemon.behavior.canSwim && !animations.includes("water_idle")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can swim but has no 'water_idle' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.water_idle`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
      if (pokemon.behavior.canWalk && !animations.includes("walking")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can walk but has no 'walking' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.walking`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
      if (pokemon.behavior.canSleep && !animations.includes("sleeping")) {
        Debugger.warn(
          `Pokemon ${pokemonTypeId} can sleep but has no 'sleeping' animation.`
        );
        entityFile["minecraft:client_entity"].description.animations[
          `animation.${pokemonTypeId}.sleeping`
        ] = "animation.${pokemonTypeId}.ground_idle";
      }
    }
    // Verify Pokemon Textures
    const textures = fs.readdirSync(
      path.join("textures", "entity", "pokemon", pokemonTypeId)
    );
    if (!textures.includes(pokemonTypeId + ".png")) {
      Debugger.error(`Pokemon ${pokemonTypeId} has no default texture!`);
    }
    if (!textures.includes("shiny_" + pokemonTypeId + ".png")) {
      Debugger.error(`Pokemon ${pokemonTypeId} has no shiny texture!`);
      const defaultTexturePath = `textures/entity/pokemon/${pokemonTypeId}/${pokemonTypeId}.png`;
      const entityTextures =
        entityFile["minecraft:client_entity"].description.textures;
      entityTextures["shiny"] = defaultTexturePath;
      entityTextures["shiny_male"] = defaultTexturePath;
      entityTextures["shiny_female"] = defaultTexturePath;
      entityFile["minecraft:client_entity"].description.textures =
        entityTextures;
    }
  }

  fs.writeFileSync(
    path.join(pokemonEntityFilesDir, pokemonTypeId + ".entity.json"),
    JSON.stringify(entityFile, null, 2)
  );
}
