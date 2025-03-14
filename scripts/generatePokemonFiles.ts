import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import sharp from "sharp";
import type {
  AnimationFile,
  EntityFile,
  GeometryFile,
  GeometryFileName,
  ItemTextureFile,
  PokemonAnimationTypes,
  PokemonJsonContent,
  PokemonTypeId,
  RenderControllerFile,
} from "./types";
import { cloneTemplate, editLangSection, Logger, safeReadJSON } from "./utils";
import { PokemonCustomizations } from "./data/customizations";

// TODO: Implement animations for skinned/gender pokemon.

// --- Paths & Initialization ---
const cwd = process.cwd();
const pokemonJsonPath = path.join(cwd, "pokemon.json");
const templatesPath = path.join(cwd, "scripts", "templates");
const pokemonEntityTemplatePath = path.join(
  templatesPath,
  "pokemon.entity.json"
);
const pokemonSubstituteEntityTemplatePath = path.join(
  templatesPath,
  "pokemonSubstitute.entity.json"
);
const pokemonRCTemplatePath = path.join(templatesPath, "pokemon.rc.json");
const pokemonEntityFilesDir = path.join(cwd, "entity", "pokemon");
const markdownLogPath = path.join(cwd, "missing_info.md");
const renderControllersPath = path.join(cwd, "render_controllers", "pokemon");
const itemTexturesPath = path.join(cwd, "textures", "item_texture.json");

// Ensure directories exist and are clean
fsExtra.ensureDirSync(pokemonEntityFilesDir);
fsExtra.ensureDirSync(renderControllersPath);
fsExtra.emptyDirSync(pokemonEntityFilesDir);
fsExtra.emptyDirSync(renderControllersPath);

// --- Global Report State ---
const report = {
  missingPokemonAnimations: new Map<string, string[]>(),
  missingPokemonTextures: new Map<string, string[]>(),
  hasInvalidAnimationNames: new Set<string>(),
  hasInvalidAnimationFiles: new Set<string>(),
  missingGeometryFiles: new Set<string>(),
  invalidGeometryFiles: new Set<string>(),
  missingAnimationFiles: new Set<string>(),
  missingSprites: new Set<string>(),
  missingParticleCustomizations: new Map<string, Set<string>>(),
  invalidParticleCustomization: new Map<string, string[]>(),
};

// --- Load Template Files ---
const pokemonJson = safeReadJSON<PokemonJsonContent>(pokemonJsonPath);
if (!pokemonJson) {
  Logger.error("Cannot proceed without a valid pokemon.json");
  process.exit(1);
}

const pokemonEntityFileTemplate = safeReadJSON<EntityFile>(
  pokemonEntityTemplatePath
);
const pokemonSubstituteEntityTemplate = safeReadJSON<EntityFile>(
  pokemonSubstituteEntityTemplatePath
);
const pokemonRCTemplate = safeReadJSON<RenderControllerFile>(
  pokemonRCTemplatePath
);
const itemTexturesFile = safeReadJSON<ItemTextureFile>(itemTexturesPath);
if (
  !pokemonEntityFileTemplate ||
  !pokemonSubstituteEntityTemplate ||
  !pokemonRCTemplate ||
  !itemTexturesFile
) {
  Logger.error("One or more template files are missing or invalid.");
  process.exit(1);
}

// --- Core Functions ---

/**
 * Checks if a valid geometry file exists for the given Pokémon type.
 */
function isValidGeometryFile(pokemonTypeId: GeometryFileName): boolean {
  const filePath = path.join(
    "models",
    "entity",
    "pokemon",
    `${pokemonTypeId}.geo.json`
  );
  if (!fs.existsSync(filePath)) {
    report.missingGeometryFiles.add(pokemonTypeId);
    Logger.error(`Missing geometry file for ${pokemonTypeId}!`);
    return false;
  }
  const geometryFile = safeReadJSON<GeometryFile>(filePath);
  if (!geometryFile) {
    report.invalidGeometryFiles.add(pokemonTypeId);
    Logger.error(`Invalid geometry file for ${pokemonTypeId}!`);
    return false;
  }
  const valid = geometryFile["minecraft:geometry"].some(
    (g) => g.description.identifier === `geometry.${pokemonTypeId}`
  );
  if (!valid) {
    report.invalidGeometryFiles.add(pokemonTypeId);
    Logger.error(
      `Geometry file for "${pokemonTypeId}" does not contain a valid identifier!`
    );
  }
  return valid;
}

/**
 * Verifies and updates geometries for the given Pokémon type.
 */
function verifyAndUpdateGeometries(
  pokemonTypeId: PokemonTypeId,
  entityFile: EntityFile
): EntityFile {
  const customizations = PokemonCustomizations[pokemonTypeId];
  const geometryTypeIds: { [key: string]: GeometryFileName } = {};

  if (customizations) {
    const hasModelGenderDifference =
      customizations.genderDifferences?.includes("model");
    if (hasModelGenderDifference) {
      geometryTypeIds[`male_default`] =
        `geometry.male_${pokemonTypeId}` as GeometryFileName;
      geometryTypeIds[`female_default`] =
        `geometry.female_${pokemonTypeId}` as GeometryFileName;
    } else {
      geometryTypeIds[`default`] = ("geometry." +
        pokemonTypeId) as GeometryFileName;
    }

    // Add geometry types for skins.
    const skinsWithModelDifference = Object.entries(
      customizations.skins ?? {}
    ).filter(([, options]) => options.includes("model"));
    for (const [skin] of skinsWithModelDifference) {
      const skinId = `${pokemonTypeId}_${skin}`;
      if (hasModelGenderDifference) {
        geometryTypeIds[`male_${skin}`] =
          `geometry.male_${skinId}` as GeometryFileName;
        geometryTypeIds[`female_${skin}`] =
          `geometry.female_${skinId}` as GeometryFileName;
      } else {
        geometryTypeIds[`${skin}`] = ("geometry." + skinId) as GeometryFileName;
      }
    }
  } else {
    geometryTypeIds[`default`] = ("geometry." +
      pokemonTypeId) as GeometryFileName;
  }

  // Check if geometry files are valid.
  Object.entries(geometryTypeIds).forEach(([key, value]) => {
    if (
      !isValidGeometryFile(value.replace("geometry.", "") as GeometryFileName)
    ) {
      // TODO: Remove once all gender differences are defined.
      geometryTypeIds[key] = `geometry.${pokemonTypeId}` as GeometryFileName;
    }
  });

  // Set geometry types in the entity file.
  entityFile["minecraft:client_entity"].description.geometry = geometryTypeIds;
  return entityFile;
}

/**
 * Retrieves defined animations for the given Pokémon type.
 */
function getDefinedAnimations(
  pokemonTypeId: PokemonTypeId
): string[] | undefined {
  const filePath = path.join(
    "animations",
    "pokemon",
    `${pokemonTypeId}.animation.json`
  );
  if (!fs.existsSync(filePath)) {
    report.missingAnimationFiles.add(pokemonTypeId);
    Logger.error(`Missing animation file for ${pokemonTypeId}!`);
    return undefined;
  }
  const animationFile = safeReadJSON<AnimationFile>(filePath);
  if (!animationFile || !animationFile.animations) {
    report.hasInvalidAnimationFiles.add(pokemonTypeId);
    Logger.error(`Animation file for ${pokemonTypeId} is invalid or empty.`);
    return undefined;
  }
  const animationNames = Object.keys(animationFile.animations).map(
    (a) => a.split(".")[2] ?? "INVALID_ANIMATION_NAME"
  );
  for (const name of animationNames) {
    if (name === "INVALID_ANIMATION_NAME") {
      report.hasInvalidAnimationNames.add(pokemonTypeId);
      Logger.error(`Invalid animation name found in ${filePath}!`);
    }
  }
  return animationNames.filter((a) => a !== "INVALID_ANIMATION_NAME");
}

/**
 * Extracts used particle effect keys from a Pokémon’s animation file.
 */
function getAnimationUsedEffects(pokemonTypeId: PokemonTypeId): Set<string> {
  const filePath = path.join(
    "animations",
    "pokemon",
    `${pokemonTypeId}.animation.json`
  );
  if (!fs.existsSync(filePath))
    throw new Error(`Missing animation file for ${pokemonTypeId}!`);
  const animationFile = safeReadJSON<AnimationFile>(filePath);
  const effects = new Set<string>();
  if (animationFile && animationFile.animations) {
    for (const animation of Object.values(animationFile.animations)) {
      if (!animation.particle_effects) continue;
      for (const effect of Object.values(animation.particle_effects)) {
        if (effect && effect.effect) {
          effects.add(effect.effect);
        }
      }
    }
  }
  return effects;
}

/**
 * Updates the entity file with animations based on the Pokémon’s behavior.
 */
function updateEntityFileWithAnimations(
  pokemonTypeId: PokemonTypeId,
  entityFile: EntityFile,
  animations: string[]
): EntityFile {
  const description = entityFile["minecraft:client_entity"].description;
  const defaultAnimation = `animation.${pokemonTypeId}.ground_idle`;
  const pokemonEntry = pokemonJson!.pokemon[pokemonTypeId];
  if (!pokemonEntry || !pokemonEntry.behavior) {
    Logger.error(`No behavior defined for ${pokemonTypeId}.`);
    return entityFile;
  }
  const behavior = pokemonEntry.behavior;

  const requirementMap: Record<
    (typeof PokemonAnimationTypes)[number],
    keyof typeof behavior | null
  > = {
    flying: "canFly",
    air_idle: "canFly",
    swimming: "canSwim",
    water_idle: "canSwim",
    walking: "canWalk",
    ground_idle: null,
    sleeping: "canSleep",
    blink: "canLook",
    attack: null,
    faint: null,
  };

  for (const [animKey, requirement] of Object.entries(requirementMap)) {
    if (!requirement) continue;
    if (behavior[requirement] && animations.includes(animKey)) continue;
    const missing = report.missingPokemonAnimations.get(pokemonTypeId) || [];
    missing.push(animKey);
    report.missingPokemonAnimations.set(pokemonTypeId, missing);
    if (animKey !== "blink") {
      description.animations[animKey] = defaultAnimation;
    }
  }

  const customizations = PokemonCustomizations[pokemonTypeId];
  if (customizations && customizations.animatedTextureConfig) {
    description.materials["default"] = "custom_animated";
  }

  // Handle particle effects.
  const effects = getAnimationUsedEffects(pokemonTypeId);
  if (customizations?.animationParticleEffects && effects.size > 0) {
    description.particle_effects = {};
    for (const effectTypeId of customizations.animationParticleEffects) {
      const effectName = effectTypeId.split(":")[1];
      if (!effectName || !effects.has(effectName)) {
        Logger.error(
          `For ${pokemonTypeId}, customization defines particle effect '${effectTypeId}' but the animation file does not use '${effectName}'.`
        );
        const invalid =
          report.invalidParticleCustomization.get(pokemonTypeId) || [];
        invalid.push(effectName || "unknown");
        report.invalidParticleCustomization.set(pokemonTypeId, invalid);
        continue;
      }
      description.particle_effects[effectName] = effectTypeId;
    }
  } else if (effects.size > 0) {
    Logger.error(
      `${pokemonTypeId} uses particle effects (${[...effects].join(
        ", "
      )}) but no animationParticleEffects customization is defined.`
    );
    report.missingParticleCustomizations.set(pokemonTypeId, effects);
  }
  entityFile["minecraft:client_entity"].description = description;
  return entityFile;
}

/**
 * Verifies and updates textures for the given Pokémon type.
 */
function verifyAndUpdateTextures(
  pokemonTypeId: PokemonTypeId,
  entityFile: EntityFile
): EntityFile {
  // Read all textures from the directory.
  const texturesDir = path.join("textures", "entity", "pokemon", pokemonTypeId);
  let textures: string[] = [];
  try {
    textures = fs.readdirSync(texturesDir);
  } catch (error) {
    Logger.error(`Error reading textures for ${pokemonTypeId}: ${error}`);
  }

  // Define the texture path function.
  const getTexturePath = (fileName: string) =>
    path.join(texturesDir, fileName).replace(/\\/g, "/");

  // Fetch already missing textures.
  const missingTextures =
    report.missingPokemonTextures.get(pokemonTypeId) || [];

  // Read the entity file textures.
  const entityTextures =
    entityFile["minecraft:client_entity"].description.textures;

  /**
   * Ensures the basic textures are present and updates the entity file.
   */
  const ensureBasicTextures = () => {
    const defaultTexture = `${pokemonTypeId}.png`;
    if (!textures.includes(defaultTexture)) {
      Logger.error(`Missing default texture for ${pokemonTypeId}!`);
      missingTextures.push(defaultTexture);
      // We cant fix this so it will just show up broken in game.
    } else {
      entityTextures["default"] = getTexturePath(defaultTexture);
    }

    // Check for shiny texture.
    const shinyTexture = `shiny_${pokemonTypeId}.png`;
    if (!textures.includes(shinyTexture)) {
      Logger.error(`Missing shiny texture for ${pokemonTypeId}!`);
      missingTextures.push(shinyTexture);

      // Set it to use the default texture, which is a fallback.
      entityTextures["shiny_default"] = getTexturePath(defaultTexture);
    } else {
      entityTextures["shiny_default"] = getTexturePath(shinyTexture);
    }
  };

  const customizations = PokemonCustomizations[pokemonTypeId];
  if (customizations && customizations.genderDifferences) {
    const changesModel = customizations.genderDifferences.includes("model");
    const changesTexture =
      customizations.genderDifferences.includes("texture") || changesModel;
    if (changesTexture || changesModel) {
      for (const gender of ["male", "female"]) {
        const defaultTex = `${gender}_${pokemonTypeId}.png`;
        if (!textures.includes(defaultTex)) {
          Logger.error(`Missing texture ${defaultTex} for ${pokemonTypeId}!`);
          missingTextures.push(defaultTex);

          // Set it to use the default texture, which is a fallback (we hope this is defined).
          // TODO: Remove this once all gender differences are defined.
          entityTextures[`${gender}_default`] = getTexturePath(
            `${pokemonTypeId}.png`
          );
        } else {
          entityTextures[`${gender}_default`] = getTexturePath(defaultTex);
        }

        // Check for shiny texture.
        const shinyTex = `${gender}_shiny_${pokemonTypeId}.png`;
        if (!textures.includes(shinyTex)) {
          Logger.error(`Missing texture ${shinyTex} for ${pokemonTypeId}!`);
          missingTextures.push(shinyTex);

          // Set it to use the default texture, which is a fallback (we hope this is defined).
          // TODO: Remove this once all gender differences are defined.
          entityTextures[`shiny_${gender}_default`] = getTexturePath(
            `${pokemonTypeId}.png`
          );
        } else {
          entityTextures[`shiny_${gender}_default`] = getTexturePath(shinyTex);
        }
      }
    } else {
      ensureBasicTextures();
    }
  } else {
    ensureBasicTextures();
  }

  // Verify skin textures if defined.
  const verifySkinTexture = (skinId: string) => {
    const fileName = `${skinId}.png`;
    const texturePath = getTexturePath(fileName);
    if (!textures.includes(fileName)) {
      Logger.error(`Missing texture ${fileName} for ${pokemonTypeId}!`);
      missingTextures.push(fileName);
      // We cant fix this so it will just show up broken in game.
      // We don't want to return here, as we still want the texture defined just being broken.
    }

    // Remove the Pokémon ID prefix if present.
    entityTextures[skinId.replace(`${pokemonTypeId}_`, "")] = texturePath;
  };

  const skins = Object.entries(customizations?.skins ?? {});
  for (const [skinId, options] of skins) {
    if (!options.includes("texture") && !options.includes("model")) continue;
    const skinnedId = `${pokemonTypeId}_${skinId}`;
    if (customizations?.genderDifferences) {
      for (const gender of ["male", "female"]) {
        verifySkinTexture(`${gender}_${skinnedId}`);
      }
    } else {
      verifySkinTexture(skinnedId);
    }
  }

  // Add to report if found missing textures.
  if (missingTextures.length > 0)
    report.missingPokemonTextures.set(pokemonTypeId, missingTextures);

  // Update the entity file with the textures.
  entityFile["minecraft:client_entity"].description.textures = entityTextures;
  return entityFile;
}

/**
 * Creates a render controller for the given Pokémon type.
 */
function makeRenderController(pokemonTypeId: PokemonTypeId): void {
  const customizations = PokemonCustomizations[pokemonTypeId];
  if (!customizations) {
    Logger.warn(
      `No customizations provided for ${pokemonTypeId}; skipping render controller creation.`
    );
    return;
  }

  let templateString = JSON.stringify(pokemonRCTemplate, null, 2).replace(
    /\{speciesId\}/g,
    pokemonTypeId
  );

  // Create texture Parser molang.
  let textureParserMolang = "";
  let textureParserMolangFile = "textureParser.molang";
  const skinKeys = Object.keys(customizations.skins ?? {});
  const hasTextureDifferencesWithGender =
    customizations.genderDifferences?.includes("texture") ||
    customizations.genderDifferences?.includes("model");
  if (skinKeys.length > 0 && hasTextureDifferencesWithGender) {
    textureParserMolangFile = "skinnedGenderTextureParser.molang";
  } else if (skinKeys.length > 0) {
    textureParserMolangFile = "skinnedTextureParser.molang";
  } else if (hasTextureDifferencesWithGender) {
    textureParserMolangFile = "genderTextureParser.molang";
  }
  try {
    textureParserMolang = fs
      .readFileSync(
        path.join(templatesPath, "molang", textureParserMolangFile),
        "utf-8"
      )
      .replace(/\s+/g, "");
  } catch (error) {
    throw new Error(
      `Error reading texture parser file ${textureParserMolangFile}: ${error}`
    );
  }

  // Replace the molang parser in the template.
  templateString = templateString.replace(
    /'\{textureParser\.molang\}'/g,
    textureParserMolang
  );

  // Parse the render controller JSON.
  let rcFile: RenderControllerFile;
  try {
    rcFile = JSON.parse(templateString);
  } catch (error) {
    throw new Error(
      `Error parsing render controller JSON for ${pokemonTypeId}: ${error}`
    );
  }

  const renderer =
    rcFile.render_controllers[`controller.render.pokemon:${pokemonTypeId}`];
  if (!renderer)
    throw new Error(
      `No renderer found in render controller for ${pokemonTypeId}`
    );

  // Parse and Setup Types for Render Controller
  type AppearanceId = `${"male_" | "female_" | ""}${
    | keyof typeof customizations.skins
    | "default"}`;
  let textures =
    (renderer.arrays.textures["Array.textureVariants"] as `Texture.${
      | "shiny_"
      | ""}${AppearanceId}`[]) || [];
  let geometries =
    (renderer.arrays.geometries[
      "Array.geometryVariants"
    ] as `Geometry.${AppearanceId}`[]) || [];

  // Define the default textures and geometries.
  if (customizations.genderDifferences) {
    if (hasTextureDifferencesWithGender)
      textures = [
        "Texture.male_default",
        "Texture.shiny_male_default",
        "Texture.female_default",
        "Texture.shiny_female_default",
      ];
    if (customizations.genderDifferences.includes("model"))
      geometries = ["Geometry.male_default", "Geometry.female_default"];
  } else {
    textures = ["Texture.default", "Texture.shiny_default"];
    geometries = ["Geometry.default"];
  }

  // Add texture and geometry variants based on skins.
  for (const skin of skinKeys) {
    const options = customizations.skins?.[skin];
    if (!options) continue;
    const hasModel = options.includes("model");
    const hasTexture = options.includes("texture") || hasModel;

    // If this pokemon requires different textures by gender, we need to map.
    if (hasTextureDifferencesWithGender) {
      for (const gender of ["male", "female"]) {
        const appearanceId = `${gender}_${skin}` as AppearanceId;
        if (hasModel) geometries.push(`Geometry.${appearanceId}`);
        if (hasTexture) textures.push(`Texture.${appearanceId}`);
      }
    } else {
      const appearanceId = skin as AppearanceId;
      if (hasModel) geometries.push(`Geometry.${appearanceId}`);
      if (hasTexture) textures.push(`Texture.${appearanceId}`);
    }
  }

  // Set textures and geometries.
  renderer.arrays.textures["Array.textureVariants"] = textures;
  renderer.arrays.geometries["Array.geometryVariants"] = geometries;

  // Load animated texture mapping.
  if (customizations.animatedTextureConfig) {
    const [frameCount, fps] = customizations.animatedTextureConfig;
    renderer.uv_anim = {
      offset: [
        0.0,
        `math.mod(math.floor(q.life_time * ${fps}), ${frameCount}) / ${frameCount}`,
      ],
      scale: [1.0, `1.0 / ${frameCount}`],
    };
  }

  // Register all changes to the render controller.
  rcFile.render_controllers[`controller.render.pokemon:${pokemonTypeId}`] =
    renderer;

  // Build the geometryParser.
  let geometryParser = "";
  const geometryVariants = ["default"].concat(
    Object.keys(customizations.skins ?? {}).filter((s) =>
      customizations.skins?.[s].includes("model")
    )
  );
  const skinKeysArray = Object.keys(customizations.skins ?? {});
  for (const variant of geometryVariants) {
    // Determine skin index using keys array.
    let skinId = skinKeysArray.indexOf(variant);
    skinId = skinId === -1 ? 0 : skinId + 1;
    if (customizations.genderDifferences?.includes("model")) {
      for (const gender of ["male", "female"]) {
        const appearanceId = `${gender}_${variant}` as AppearanceId;
        const geometryIdIndex = geometries.indexOf(`Geometry.${appearanceId}`);
        if (geometryIdIndex === -1) {
          Logger.error(
            `Missing geometry for ${pokemonTypeId} with appearanceId: ${appearanceId}`
          );
          continue;
        }
        geometryParser += `(query.skin_id==${skinId} && query.property('pokeb:gender')=='${gender}')?${geometryIdIndex}:`;
      }
    } else {
      const appearanceId = variant as AppearanceId;
      const geometryIdIndex = geometries.indexOf(`Geometry.${appearanceId}`);
      if (geometryIdIndex === -1) {
        Logger.error(
          `Missing geometry for ${pokemonTypeId} with appearanceId: ${appearanceId}`
        );
        continue;
      }
      geometryParser += `(query.skin_id==${skinId})?${geometryIdIndex}:`;
    }
  }

  // Append default geometry, if molang fails.
  geometryParser += "0";

  // Set the geometry parser in the render controller.
  rcFile.render_controllers[
    `controller.render.pokemon:${pokemonTypeId}`
  ].geometry = `Array.geometryVariants[${geometryParser}]`;

  // Write the render controller file.
  try {
    fsExtra.writeJSONSync(
      path.join(renderControllersPath, `${pokemonTypeId}.rc.json`),
      rcFile,
      { spaces: 2 }
    );
  } catch (error) {
    Logger.error(
      `Error writing render controller for ${pokemonTypeId}: ${error}`
    );
  }
}

/**
 * Checks and (if needed) generates sprites for the given Pokémon type.
 */
async function checkAndEnsureSprites(pokemonTypeId: PokemonTypeId) {
  const spriteDir = path.join("textures", "sprites", "default");
  const darkSpriteDir = path.join("textures", "sprites", "dark");
  const customizations = PokemonCustomizations[pokemonTypeId];
  const skinKeys = Object.keys(customizations?.skins ?? {});
  const sprites = [
    pokemonTypeId,
    ...skinKeys.map((s) => `${pokemonTypeId}_${s.replace(/_/g, "")}`),
  ];
  for (const sprite of sprites) {
    const spritePath = path.join(spriteDir, `${sprite}.png`);
    const darkSpritePath = path.join(darkSpriteDir, `${sprite}.png`);
    if (!fs.existsSync(spritePath)) {
      Logger.error(`Missing sprite for ${sprite} at ${spritePath}`);
      report.missingSprites.add(sprite);
      continue;
    }
    if (!fs.existsSync(darkSpritePath)) {
      Logger.info(`Generating dark sprite for ${sprite}...`);
      try {
        const image = sharp(spritePath);
        const metadata = await image.metadata();
        if (!metadata.width || !metadata.height) {
          Logger.error(`Invalid metadata for ${sprite}`);
          continue;
        }
        const rawImageData = await image.raw().toBuffer();
        for (let i = 0; i < rawImageData.length; i += 4) {
          rawImageData[i] = 10; // Red
          rawImageData[i + 1] = 10; // Green
          rawImageData[i + 2] = 10; // Blue
        }
        await sharp(rawImageData, {
          raw: { width: metadata.width, height: metadata.height, channels: 4 },
        }).toFile(darkSpritePath);
        Logger.info(`Dark sprite generated for ${sprite}!`);
      } catch (error) {
        Logger.error(`Error processing image for ${sprite}: ${error}`);
      }
    }
    // Update item textures
    itemTexturesFile!.texture_data[sprite] = {
      textures: spritePath.replace(/\\/g, "/"),
    };
  }
}

/**
 * Processes each Pokémon entry.
 */
async function processPokemon() {
  Logger.info("Starting Pokémon processing...");
  for (const [pokemonTypeId, pokemon] of Object.entries(pokemonJson!.pokemon)) {
    try {
      const typeId = pokemonTypeId as PokemonTypeId;
      const hasModel = pokemonJson!.pokemonWithModels.includes(typeId);
      const template = hasModel
        ? pokemonEntityFileTemplate
        : pokemonSubstituteEntityTemplate;
      let entityFile: EntityFile = cloneTemplate(template!, typeId);
      const customizations = PokemonCustomizations[typeId];

      if (hasModel) {
        entityFile = verifyAndUpdateGeometries(typeId, entityFile);
        const animations = getDefinedAnimations(typeId);
        if (animations) {
          entityFile = updateEntityFileWithAnimations(
            typeId,
            entityFile,
            animations
          );
        } else {
          Logger.error(`Pokémon ${typeId} has no defined animations.`);
        }
        entityFile = verifyAndUpdateTextures(typeId, entityFile);
      }

      if (
        customizations?.animatedTextureConfig ||
        customizations?.genderDifferences ||
        customizations?.skins
      ) {
        makeRenderController(typeId);
      } else if (hasModel) {
        // Fallback render controller
        entityFile[
          "minecraft:client_entity"
        ].description.render_controllers[0] = {
          "controller.render.pokemon": "query.variant==0",
        };
      }

      fsExtra.writeJSONSync(
        path.join(pokemonEntityFilesDir, `${typeId}.entity.json`),
        entityFile,
        { spaces: 2 }
      );
      await checkAndEnsureSprites(typeId);
    } catch (error) {
      Logger.error(`Error processing Pokémon ${pokemonTypeId}: ${error}`);
    }
  }

  // Update language file and generate markdown report.
  try {
    const langFilePath = path.join(cwd, "texts", "en_US.lang");
    const spawnEggEntries = Object.keys(pokemonJson!.pokemon)
      .map(
        (s) =>
          `item.spawn_egg.entity.pokemon:${s}.name=${
            pokemonJson!.pokemon[s as PokemonTypeId].name
          }`
      )
      .join("\n");
    editLangSection(langFilePath, "Pokemon Spawn Eggs", spawnEggEntries);
    const dismountEntries = Object.keys(pokemonJson!.pokemon)
      .filter((p) => pokemonJson!.pokemon[p as PokemonTypeId].canMount)
      .map(
        (species) =>
          `action.hint.exit.pokemon:${species}=Tap sneak to dismount\naction.hint.exit.console.pokemon:${species}=Press :_input_key.jump: to dismount`
      )
      .join("\n");
    editLangSection(langFilePath, "Dismount Messages", dismountEntries);
    fsExtra.writeJSONSync(itemTexturesPath, itemTexturesFile, { spaces: 2 });

    // Generate markdown report.
    let markdownContent = `# Missing Information Report\n\nThis report contains details about missing or problematic elements found during the Pokémon processing.\n\n`;
    markdownContent += `## Pokémon Missing Geometry Files\n`;
    if (report.missingGeometryFiles.size > 0) {
      report.missingGeometryFiles.forEach((_, id) => {
        markdownContent += `- [${id}](models/entity/pokemon/${id}.geo.json)\n`;
      });
    } else {
      markdownContent += "No Pokémon missing geometry files found!\n";
    }
    markdownContent += `\n## Pokémon With Invalid Geometry Files\n`;
    if (report.invalidGeometryFiles.size > 0) {
      report.invalidGeometryFiles.forEach((id) => {
        markdownContent += `- [${id}](models/entity/pokemon/${id}.geo.json)\n`;
      });
    } else {
      markdownContent += "No Pokémon have invalid geometry files!\n";
    }
    markdownContent += `\n## Pokémon With Missing Animation Files\n`;
    if (report.missingAnimationFiles.size > 0) {
      report.missingAnimationFiles.forEach((id) => {
        markdownContent += `- ${id}\n`;
      });
    } else {
      markdownContent += "No Pokémon are missing animation files!\n";
    }
    markdownContent += `\n## Missing Pokémon Textures\n`;
    if (report.missingPokemonTextures.size > 0) {
      report.missingPokemonTextures.forEach((textures, id) => {
        markdownContent += `- [${id}](textures/entity/pokemon/${id}/): ${textures.join(
          ", "
        )}\n`;
      });
    } else {
      markdownContent += "No Pokémon have missing textures!\n";
    }
    markdownContent += `\n## Missing Pokémon Sprite Textures\n`;
    if (report.missingSprites.size > 0) {
      report.missingSprites.forEach((id) => {
        markdownContent += `- [${id}](textures/sprites/default/${id})\n`;
      });
    } else {
      markdownContent += "No Pokémon have missing sprite textures!\n";
    }
    markdownContent += `\n## Pokémon with Invalid Animation Names\n`;
    if (report.hasInvalidAnimationNames.size > 0) {
      report.hasInvalidAnimationNames.forEach((id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json)\n`;
      });
    } else {
      markdownContent += "No Pokémon have invalid animation names!\n";
    }
    markdownContent += `\n## Pokémon With Invalid Animation Files\n`;
    if (report.hasInvalidAnimationFiles.size > 0) {
      report.hasInvalidAnimationFiles.forEach((id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json)\n`;
      });
    } else {
      markdownContent += "No Pokémon have invalid animation files!\n";
    }
    markdownContent += `\n## Missing Particle Customizations\n`;
    if (report.missingParticleCustomizations.size > 0) {
      report.missingParticleCustomizations.forEach((effects, id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json): ${[
          ...effects,
        ].join(", ")}\n`;
      });
    } else {
      markdownContent += "No missing particle customizations found.\n";
    }
    markdownContent += `\n## Invalid Particle Customizations\n`;
    if (report.invalidParticleCustomization.size > 0) {
      report.invalidParticleCustomization.forEach((effects, id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json): ${effects.join(
          ", "
        )}\n`;
      });
    } else {
      markdownContent += "No invalid particle customizations found.\n";
    }
    markdownContent += `\n## Missing Pokémon Animations\n`;
    markdownContent += `\n> [!NOTE]\n> Some of these could be a result of missing [behavior sets](https://github.com/pokebedrock/pokemonComponents).\n\n`;
    if (report.missingPokemonAnimations.size > 0) {
      report.missingPokemonAnimations.forEach((anims, id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json): ${anims.join(
          ", "
        )}\n`;
      });
    } else {
      markdownContent += "No missing Pokémon animations found.\n";
    }
    fs.writeFileSync(markdownLogPath, markdownContent);
    Logger.info(`Markdown report generated at ${markdownLogPath}`);
  } catch (error) {
    Logger.error(
      `Error updating language files or generating report: ${error}`
    );
  }
  Logger.info("Pokémon processing completed.");
}

// --- Main Entry Point ---
async function main() {
  await processPokemon();
}

main().catch((err) => Logger.error(`Unexpected error: ${err}`));
