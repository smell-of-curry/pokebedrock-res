import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import sharp from "sharp";
import type {
  AnimationFile,
  AnimationControllerFile,
  EntityFile,
  GeometryFile,
  GeometryFileName,
  ItemTextureFile,
  PokemonAnimationTypes,
  PokemonJsonContent,
  PokemonTypeId,
  RenderControllerFile,
  PokemonSkinOptionObject,
} from "./types";
import {
  cloneTemplate,
  editLangSection,
  Logger,
  safeReadJSON,
  getSkinDifferences,
  skinOptionIncludes,
} from "./utils";
import {
  PokemonCustomization,
  PokemonCustomizations,
} from "./data/customizations";
import { writeFileIfChanged, writeImageIfChanged } from "./utils";
import { writeJsonFileSync } from "write-json-file";

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
const pokemonACTemplatePath = path.join(
  templatesPath,
  "pokemon.animation_controller.json"
);
const pokemonEntityFilesDir = path.join(cwd, "entity", "pokemon");
const markdownLogPath = path.join(cwd, "missing_info.md");
const renderControllersPath = path.join(cwd, "render_controllers", "pokemon");
const animationControllersPath = path.join(
  cwd,
  "animation_controllers",
  "pokemon"
);
const itemTexturesPath = path.join(cwd, "textures", "item_texture.json");

// Ensure directories exist and are clean
fsExtra.ensureDirSync(pokemonEntityFilesDir);
fsExtra.ensureDirSync(renderControllersPath);
fsExtra.ensureDirSync(animationControllersPath);
fsExtra.emptyDirSync(pokemonEntityFilesDir);
fsExtra.emptyDirSync(renderControllersPath);
fsExtra.emptyDirSync(animationControllersPath);

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
  invalidBlinkAnimations: new Map<string, string[]>(),
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
const pokemonACTemplate = safeReadJSON<AnimationControllerFile>(
  pokemonACTemplatePath
);
const itemTexturesFile = safeReadJSON<ItemTextureFile>(itemTexturesPath);
if (
  !pokemonEntityFileTemplate ||
  !pokemonSubstituteEntityTemplate ||
  !pokemonRCTemplate ||
  !pokemonACTemplate ||
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
 * Checks if this pokemon's customizations requires a custom evolution render controller
 * required when the model could change.
 *
 * @param customizations
 * @returns
 */
function needsCustomEvoController(customizations: PokemonCustomization) {
  return (
    customizations.genderDifferences?.includes("model") ||
    Object.values(customizations.skins ?? []).some((s) =>
      (Array.isArray(s) ? s : s.differences).includes("model")
    )
  );
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
    const pokemonTypeIdToUse = customizations.inherits?.model || pokemonTypeId;
    const hasModelGenderDifference =
      customizations.genderDifferences?.includes("model");

    if (hasModelGenderDifference) {
      geometryTypeIds[`male_default`] =
        `geometry.male_${pokemonTypeIdToUse}` as GeometryFileName;
      geometryTypeIds[`female_default`] =
        `geometry.female_${pokemonTypeIdToUse}` as GeometryFileName;
    } else {
      geometryTypeIds[`default`] = ("geometry." +
        pokemonTypeIdToUse) as GeometryFileName;
    }

    // Add geometry types for skins.
    const skinsWithModelDifference = Object.entries(
      customizations.skins ?? {}
    ).filter(([, options]) => skinOptionIncludes(options, "model"));
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
  const customizations = PokemonCustomizations[pokemonTypeId];
  const description = entityFile["minecraft:client_entity"].description;
  const defaultAnimation = `animation.${pokemonTypeId}.ground_idle`;
  const pokemonEntry = pokemonJson!.pokemon[pokemonTypeId];
  if (!pokemonEntry || !pokemonEntry.behavior) {
    Logger.error(`No behavior defined for ${pokemonTypeId}.`);
    return entityFile;
  }
  const behavior = pokemonEntry.behavior;
  const skinAnimations = getSkinSpecificAnimations(pokemonTypeId);

  type AnimationKey = (typeof PokemonAnimationTypes)[number];
  const requirementMap: Record<AnimationKey, keyof typeof behavior | null> = {
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

  // Get the animations that this pokemon inherits.
  const inheritedAnimations = (
    customizations?.inherits?.animations
      ? Object.keys(requirementMap)
      : Object.keys(customizations?.inherits ?? {})
          .filter((a) => a.startsWith("animation_"))
          .map((a) => a.replace("animation_", ""))
  ) as AnimationKey[];

  for (const [animKey, requirement] of Object.entries(requirementMap)) {
    if (inheritedAnimations.includes(animKey as AnimationKey)) {
      // This pokemon inherits animations from another pokemon.
      const inheritsFrom =
        customizations?.inherits?.animations ||
        customizations?.inherits?.[
          `animation_${animKey}` as keyof typeof customizations.inherits
        ];

      description.animations[animKey] = `animation.${inheritsFrom}.${animKey}`;
      continue;
    }
    if (!requirement) continue;
    if (behavior[requirement] && animations.includes(animKey)) continue;
    const missingReport =
      report.missingPokemonAnimations.get(pokemonTypeId) || [];
    missingReport.push(animKey);
    report.missingPokemonAnimations.set(pokemonTypeId, missingReport);
    if (animKey === "blink") continue;
    description.animations[`default_${animKey}`] = defaultAnimation;
  }

  // Helper function to insert a key before a target key (so it looks neat in the entity file).
  const insertKeyBefore = (
    obj: Record<string, any>,
    newKey: string,
    newValue: any,
    targetKey: string
  ) => {
    let result: Record<string, any> = {};
    for (let key in obj) {
      if (key === targetKey) {
        result[newKey] = newValue;
      }
      result[key] = obj[key];
    }
    return result;
  };

  // Add animations for skinned pokemon.
  if (Object.keys(skinAnimations).length > 0) {
    for (const skin of Object.keys(skinAnimations)) {
      const animations = skinAnimations[skin];
      for (const animation of animations) {
        description.animations = insertKeyBefore(
          description.animations,
          `${skin}_${animation}`,
          `animation.${pokemonTypeId}_${skin}.${animation}`,
          `look_at_target`
        );
      }
    }
  } else {
    // Switch to use default animation controller.
    description.animations["attack"] = `animation.${pokemonTypeId}.attack`;
    delete description.animations["default_attack"];
    description.animations["blink"] = `animation.${pokemonTypeId}.blink`;
    delete description.animations["default_blink"];
    description.animations["controller"] = "controller.animation.pokemon";
  }

  delete description.materials["aura"];
  if (customizations && customizations.animatedTextureConfig) {
    description.materials["default"] = "custom_animated";
  }
  // Add materials for skins.
  if (customizations?.skins) {
    for (const skin of Object.keys(customizations.skins)) {
      const skinOption = customizations.skins[skin];
      if ("animatedTextureConfig" in skinOption) {
        description.materials[skin] = "custom_animated";
      }
    }
  }
  description.materials["aura"] = "charged_creeper";

  // Handle particle effects.
  const effects = getAnimationUsedEffects(pokemonTypeId);
  const customizationEffects = customizations?.animationParticleEffects || [];

  // Collect particle effects from skins as well
  const skinParticleEffects: string[] = [];
  if (customizations?.skins) {
    Object.entries(customizations.skins).forEach(([_, skinOption]) => {
      if (
        skinOption &&
        typeof skinOption === "object" &&
        "differences" in skinOption &&
        skinOption.animationParticleEffects
      ) {
        skinParticleEffects.push(...skinOption.animationParticleEffects);
      }
    });
  }

  // Combine all available particle effects and deduplicate
  const allParticleEffects = [
    ...new Set([...customizationEffects, ...skinParticleEffects]),
  ];
  if (allParticleEffects && effects.size > 0) {
    description.particle_effects = {};
    for (const effectTypeId of allParticleEffects) {
      const effectName = effectTypeId.split(":")[1];
      if (!effectName || !effects.has(effectName)) {
        Logger.error(
          `For ${pokemonTypeId}, customization defines particle effect '${effectTypeId}' but the animation file does not use '${effectName}'.`
        );
        const invalid =
          report.invalidParticleCustomization.get(pokemonTypeId) || [];
        invalid.push(effectName || "unknown");
        report.invalidParticleCustomization.set(pokemonTypeId, invalid);
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
  const texturesDir = path.join("textures", "entity", "pokemon");
  let textures: string[] = [];
  try {
    textures = fs.readdirSync(path.join(texturesDir, pokemonTypeId));
  } catch (error) {
    Logger.error(`Error reading textures for ${pokemonTypeId}: ${error}`);
  }

  // Define the texture path function.
  const getTexturePath = (typeId: PokemonTypeId, fileName: string) =>
    path.join(texturesDir, typeId, fileName).replace(/\\/g, "/");

  // Fetch already missing textures.
  const missingTextures =
    report.missingPokemonTextures.get(pokemonTypeId) || [];

  // Read the entity file textures.
  const entityTextures =
    entityFile["minecraft:client_entity"].description.textures;

  /**
   * Ensures the basic textures are present and updates the entity file.
   */
  const ensureBasicTextures = (
    pokemonTypeIdToUseForTexture: PokemonTypeId,
    pokemonTypeIdToUseForShinyTexture: PokemonTypeId
  ) => {
    const defaultTexture = `${pokemonTypeIdToUseForTexture}.png`;
    if (
      pokemonTypeIdToUseForTexture === pokemonTypeId &&
      !textures.includes(defaultTexture)
    ) {
      Logger.error(`Missing default texture for ${pokemonTypeId}!`);
      missingTextures.push(defaultTexture);
      // We cant fix this so it will just show up broken in game.
    } else {
      entityTextures["default"] = getTexturePath(
        pokemonTypeIdToUseForTexture,
        defaultTexture
      );
    }

    // Check for shiny texture.
    const shinyTexture = `shiny_${pokemonTypeIdToUseForShinyTexture}.png`;
    if (
      pokemonTypeIdToUseForShinyTexture === pokemonTypeId &&
      !textures.includes(shinyTexture)
    ) {
      Logger.error(`Missing shiny texture for ${pokemonTypeId}!`);
      missingTextures.push(shinyTexture);

      // Set it to use the default texture, which is a fallback.
      entityTextures["shiny_default"] = getTexturePath(
        pokemonTypeIdToUseForTexture,
        defaultTexture
      );
    } else {
      entityTextures["shiny_default"] = getTexturePath(
        pokemonTypeIdToUseForShinyTexture,
        shinyTexture
      );
    }
  };

  const customizations = PokemonCustomizations[pokemonTypeId];
  const pokemonTypeIdToUseForTexture =
    customizations?.inherits?.texture || pokemonTypeId;
  const pokemonTypeIdToUseForShinyTexture =
    customizations?.inherits?.shiny_texture || pokemonTypeId;

  if (customizations && customizations.genderDifferences) {
    const changesModel = customizations.genderDifferences.includes("model");
    const changesTexture =
      customizations.genderDifferences.includes("texture") || changesModel;
    if (changesTexture || changesModel) {
      for (const gender of ["male", "female"]) {
        const defaultTex = `${gender}_${pokemonTypeIdToUseForTexture}.png`;
        if (
          pokemonTypeIdToUseForTexture === pokemonTypeId &&
          !textures.includes(defaultTex)
        ) {
          Logger.error(`Missing texture ${defaultTex} for ${pokemonTypeId}!`);
          missingTextures.push(defaultTex);

          // Set it to use the default texture, which is a fallback (we hope this is defined).
          // TODO: Remove this once all gender differences are defined.
          entityTextures[`${gender}_default`] = getTexturePath(
            pokemonTypeIdToUseForTexture,
            `${pokemonTypeIdToUseForTexture}.png`
          );
        } else {
          entityTextures[`${gender}_default`] = getTexturePath(
            pokemonTypeIdToUseForTexture,
            defaultTex
          );
        }

        // Check for shiny texture.

        const shinyTex = `${gender}_shiny_${pokemonTypeIdToUseForShinyTexture}.png`;
        if (
          pokemonTypeIdToUseForShinyTexture === pokemonTypeId &&
          !textures.includes(shinyTex)
        ) {
          Logger.error(`Missing texture ${shinyTex} for ${pokemonTypeId}!`);
          missingTextures.push(shinyTex);

          // Set it to use the default texture, which is a fallback (we hope this is defined).
          // TODO: Remove this once all gender differences are defined.
          entityTextures[`shiny_${gender}_default`] = getTexturePath(
            pokemonTypeIdToUseForShinyTexture,
            `${pokemonTypeIdToUseForShinyTexture}.png`
          );
        } else {
          entityTextures[`shiny_${gender}_default`] = getTexturePath(
            pokemonTypeIdToUseForShinyTexture,
            shinyTex
          );
        }
      }
    } else {
      ensureBasicTextures(
        pokemonTypeIdToUseForTexture,
        pokemonTypeIdToUseForShinyTexture
      );
    }
  } else {
    ensureBasicTextures(
      pokemonTypeIdToUseForTexture,
      pokemonTypeIdToUseForShinyTexture
    );
  }

  // Verify skin textures if defined.
  const verifySkinTexture = (skinId: string) => {
    const fileName = `${skinId}.png`;
    const texturePath = getTexturePath(pokemonTypeId, fileName);
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
    const skinDifferences = getSkinDifferences(options);
    if (
      !skinDifferences.includes("texture") &&
      !skinDifferences.includes("model")
    )
      continue;
    const skinnedId = `${pokemonTypeId}_${skinId}`;
    const hasShinyTexture = skinDifferences.includes("shiny_texture");

    if (customizations?.genderDifferences) {
      for (const gender of ["male", "female"]) {
        const genderedSkinId = `${gender}_${skinnedId}`;
        verifySkinTexture(genderedSkinId);
        if (hasShinyTexture) verifySkinTexture("shiny_" + genderedSkinId);
      }
    } else {
      verifySkinTexture(skinnedId);
      if (hasShinyTexture) verifySkinTexture("shiny_" + skinnedId);
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
 * Checks if a Pokemon has skin-specific animations.
 */
function hasSkinSpecificAnimations(pokemonTypeId: PokemonTypeId): boolean {
  const customizations = PokemonCustomizations[pokemonTypeId];
  if (!customizations?.skins) return false;

  return Object.values(customizations.skins).some((skinOption) => {
    if (Array.isArray(skinOption)) {
      return skinOption.some((diff) => diff.startsWith("animation_"));
    } else {
      return skinOption.differences.some((diff) =>
        diff.startsWith("animation_")
      );
    }
  });
}

/**
 * Gets all skin-specific animation types for a Pokemon.
 */
function getSkinSpecificAnimations(pokemonTypeId: PokemonTypeId): {
  [skinName: string]: string[];
} {
  const customizations = PokemonCustomizations[pokemonTypeId];
  if (!customizations?.skins) return {};

  const result: { [skinName: string]: string[] } = {};

  Object.entries(customizations.skins).forEach(([skinName, skinOption]) => {
    const differences = Array.isArray(skinOption)
      ? skinOption
      : skinOption.differences;

    const animationDifferences = differences.filter((diff) =>
      diff.startsWith("animation_")
    );

    if (animationDifferences.length > 0) {
      result[skinName] = animationDifferences.map((diff) =>
        diff.replace("animation_", "")
      );
    }
  });

  return result;
}

/**
 * Creates an animation controller for the given Pokémon type.
 */
function makeAnimationController(pokemonTypeId: PokemonTypeId): void {
  if (!hasSkinSpecificAnimations(pokemonTypeId)) return;

  let templateString = JSON.stringify(pokemonACTemplate, null, 2).replace(
    /\{speciesId\}/g,
    pokemonTypeId
  );

  // Parse the animation controller JSON.
  let acFile: AnimationControllerFile;
  try {
    acFile = JSON.parse(templateString);
  } catch (error) {
    throw new Error(
      `Error parsing animation controller JSON for ${pokemonTypeId}: ${error}`
    );
  }

  const controller =
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}`
    ];
  if (!controller)
    throw new Error(
      `No controller found in animation controller for ${pokemonTypeId}`
    );
  const blinkController =
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}_blink`
    ];
  if (!blinkController)
    throw new Error(
      `No blink controller found in animation controller for ${pokemonTypeId}`
    );
  const attackController =
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}_attack`
    ];
  if (!attackController)
    throw new Error(
      `No attack controller found in animation controller for ${pokemonTypeId}`
    );

  const skinAnimations = getSkinSpecificAnimations(pokemonTypeId);
  const skinKeys = Object.keys(skinAnimations);

  // Go through each state of controller (ignoring default) and append each skin that has an animation for this state.
  // If so, add a animations array entry for this skin.
  for (const state of Object.keys(controller.states)) {
    if (state === "default") continue;
    const stateController = controller.states[state];
    const animations = stateController.animations;
    if (!animations)
      throw new Error(
        `No animations found for state ${state} in animation controller for ${pokemonTypeId}`
      );

    // Add custom animations for each skin that has a custom animation for this state.
    for (const skin of skinKeys) {
      if (!skinAnimations[skin].includes(state)) continue;
      animations.push({
        [`${skin}_${state}`]: `v.skin_index == ${skinKeys.indexOf(skin) + 1}`,
      });
    }

    // Use the default animation for any skin that doesn't have a custom animation for this state.
    for (const skin of skinKeys) {
      if (skinAnimations[skin].includes(state)) continue;
      (animations[0] as any)[`default_${state}`] += ` || v.skin_index == ${
        skinKeys.indexOf(skin) + 1
      }`;
    }

    stateController.animations = animations;
    controller.states[state] = stateController;
  }

  // Check if a skin has a custom animation for blinking.
  if (
    Object.values(skinAnimations).some((animations) =>
      animations.includes("blink")
    )
  ) {
    // We need to add a custom blink animation for each skin that has a blink animation.
    const blinkStateAnimations = blinkController.states["default"].animations;
    if (!blinkStateAnimations)
      throw new Error(
        `No blink state animations found in blink controller for ${pokemonTypeId}`
      );

    // Add custom animations for each skin that has a custom animation for blinking.
    for (const skin of skinKeys) {
      if (!skinAnimations[skin].includes("default")) continue;
      blinkStateAnimations.push({
        [`${skin}_blink`]: `v.should_blink && v.skin_index == ${
          skinKeys.indexOf(skin) + 1
        }`,
      });
    }

    // Use the default animation for any skin that doesn't have a custom animation for blinking.
    for (const skin of skinKeys) {
      if (skinAnimations[skin].includes("default")) continue;
      (blinkStateAnimations[0] as any)[
        `default_blink`
      ] += ` || v.skin_index == ${skinKeys.indexOf(skin) + 1}`;
    }

    blinkController.states["default"].animations = blinkStateAnimations;
  }

  // Check if a skin has a custom attack animation.
  if (
    Object.values(skinAnimations).some((animations) =>
      animations.includes("attack")
    )
  ) {
    // We need to add a custom attack animation for each skin that has a attack animation.
    const attackStateAnimations = attackController.states["attack"].animations;
    if (!attackStateAnimations)
      throw new Error(
        `No attack state animations found in animation controller for ${pokemonTypeId}`
      );

    // Add custom animations for each skin that has a custom animation for attack.
    for (const skin of skinKeys) {
      if (!skinAnimations[skin].includes("attack")) continue;
      attackStateAnimations.push({
        [`${skin}_attack`]: `v.skin_index == ${skinKeys.indexOf(skin) + 1}`,
      });
    }

    // Use the default animation for any skin that doesn't have a custom animation for attack.
    for (const skin of skinKeys) {
      if (skinAnimations[skin].includes("attack")) continue;
      (attackStateAnimations[0] as any)[
        `default_attack`
      ] += ` || v.skin_index == ${skinKeys.indexOf(skin) + 1}`;
    }
  }

  // Write the animation controller file.
  try {
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}`
    ] = controller;
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}_blink`
    ] = blinkController;
    acFile.animation_controllers[
      `controller.animation.pokemon.${pokemonTypeId}_attack`
    ] = attackController;
    fsExtra.writeJSONSync(
      path.join(animationControllersPath, `${pokemonTypeId}.json`),
      acFile,
      { spaces: 2 }
    );
    Logger.info(`Created animation controller for ${pokemonTypeId}`);
  } catch (error) {
    Logger.error(
      `Error writing animation controller for ${pokemonTypeId}: ${error}`
    );
  }
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
  const evoRender =
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}.evolve`
    ];
  if (!renderer)
    throw new Error(
      `No renderer found in render controller for ${pokemonTypeId}`
    );

  // Parse and Setup Types for Render Controller
  const skinKeys = Object.keys(customizations.skins ?? {});
  const hasTextureDifferencesWithGender =
    customizations.genderDifferences?.includes("texture") ||
    customizations.genderDifferences?.includes("model");

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
  let materialVariants =
    (renderer.arrays.materials["Array.materialVariants"] as `Material.${
      | keyof typeof customizations.skins
      | "default"}`[]) || [];

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
    const skinOption = customizations.skins?.[skin];
    if (!skinOption) continue;

    const differences = getSkinDifferences(skinOption);
    const hasModel = differences.includes("model");
    const hasTexture = differences.includes("texture") || hasModel;
    const hasShinyTexture = differences.includes("shiny_texture");

    const pushEntries = (appearanceId: AppearanceId) => {
      if (hasModel) geometries.push(`Geometry.${appearanceId}`);
      if (hasTexture) textures.push(`Texture.${appearanceId}`);
      if (hasShinyTexture) textures.push(`Texture.shiny_${appearanceId}`);
    };

    // If this pokemon requires different textures by gender, we need to map.
    if (hasTextureDifferencesWithGender) {
      for (const gender of ["male", "female"])
        pushEntries(`${gender}_${skin}` as AppearanceId);
    } else pushEntries(skin as AppearanceId);
  }

  // Add material variants based on skins.
  materialVariants = ["Material.default"];
  for (const skin of skinKeys) {
    const skinOption = customizations.skins?.[skin];
    if (!skinOption) continue;
    if ("animatedTextureConfig" in skinOption) {
      materialVariants.push(
        `Material.${skin}` as `Material.${keyof typeof customizations.skins}`
      );
    }
  }

  // Set textures array.
  renderer.arrays.textures["Array.textureVariants"] = textures;

  // Look for skins with animated textures or particle effects
  const skinsWithAnimation = skinKeys.filter((skin) => {
    const skinOption = customizations.skins?.[skin];
    return (
      skinOption &&
      typeof skinOption === "object" &&
      "differences" in skinOption &&
      skinOption.animatedTextureConfig
    );
  });

  // If there are skins with animation, we need to handle skin-specific and parent animations
  if (skinsWithAnimation.length > 0) {
    // Build conditional expression for multiple skins
    let offsetExpr = "";
    let scaleExpr = "";

    // Process each skin with animation
    skinsWithAnimation.forEach((skinName) => {
      const skinOption = customizations.skins?.[
        skinName
      ] as PokemonSkinOptionObject;

      const skinIndex = skinKeys.indexOf(skinName) + 1; // +1 because default is at index 0
      const skinFrameCount = skinOption.animatedTextureConfig![0];
      const skinFps = skinOption.animatedTextureConfig![1];

      // Add this skin's condition to the expressions
      if (offsetExpr) {
        offsetExpr += " : ";
        scaleExpr += " : ";
      }

      offsetExpr += `(v.skin_index==${skinIndex}) ? math.mod(math.floor(q.life_time * ${skinFps}), ${skinFrameCount}) / ${skinFrameCount}`;
      scaleExpr += `(v.skin_index==${skinIndex}) ? 1.0 / ${skinFrameCount}`;
    });

    // Add parent animation as the default case if it exists
    if (customizations.animatedTextureConfig) {
      const parentFrameCount = customizations.animatedTextureConfig[0];
      const parentFps = customizations.animatedTextureConfig[1];

      if (offsetExpr) {
        offsetExpr += " : ";
        scaleExpr += " : ";
      }

      offsetExpr += `math.mod(math.floor(q.life_time * ${parentFps}), ${parentFrameCount}) / ${parentFrameCount}`;
      scaleExpr += `1.0 / ${parentFrameCount}`;
    } else {
      // If no parent animation, use static texture as fallback
      if (offsetExpr) {
        offsetExpr += " : 0.0";
        scaleExpr += " : 1.0";
      }
    }

    // Apply the animation expressions if we built any
    if (offsetExpr) {
      renderer.uv_anim = {
        offset: [0.0, offsetExpr],
        scale: [1.0, scaleExpr],
      };
    }
  } else if (customizations.animatedTextureConfig) {
    // Use the main pokemon's animated texture config for all forms
    const [frameCount, fps] = customizations.animatedTextureConfig;
    renderer.uv_anim = {
      offset: [
        0.0,
        `math.mod(math.floor(q.life_time * ${fps}), ${frameCount}) / ${frameCount}`,
      ],
      scale: [1.0, `1.0 / ${frameCount}`],
    };
  }

  // Build the texture parser.
  let textureParser = "";
  const textureVariants = ["default"]
    .concat(Object.keys(customizations.skins ?? {}))
    .entries();

  // First handle variants with gender differences

  // Handle shiny and non-shiny textures for each gender and skin combination
  for (const [idx, variant] of textureVariants) {
    let hasShiny = true;
    if (variant != "default") {
      // Is custom skin
      const skinOption = customizations.skins?.[variant];
      if (!skinOption)
        throw new Error(`Missing custom skin options for ${variant}!`);

      const differences = getSkinDifferences(skinOption);
      hasShiny = differences.includes("shiny_texture");
    }

    if (hasTextureDifferencesWithGender) {
      for (const gender of ["male", "female"] as const) {
        // Normal texture
        const normalAppearanceId = `${gender}_${variant}`;
        const normalTextureIndex = textures.indexOf(
          `Texture.${normalAppearanceId}` as (typeof textures)[number]
        );
        if (normalTextureIndex !== -1) {
          textureParser += `(v.skin_index==${idx} && query.property('pokeb:gender')=='${gender}'${
            hasShiny ? " && query.property('pokeb:shiny') == false" : ""
          }) ? ${normalTextureIndex}:`;
        }

        if (!hasShiny) continue;

        // Shiny texture
        const shinyAppearanceId = `shiny_${gender}_${variant}`;
        const shinyTextureIndex = textures.indexOf(
          `Texture.${shinyAppearanceId}` as (typeof textures)[number]
        );
        if (shinyTextureIndex !== -1) {
          textureParser += `(v.skin_index==${idx} && query.property('pokeb:gender')=='${gender}'${
            hasShiny ? " && query.property('pokeb:shiny') == true" : ""
          }) ? ${shinyTextureIndex}:`;
        }
      }
    } else {
      // Normal texture
      const normalTextureIndex = textures.indexOf(
        `Texture.${variant}` as (typeof textures)[number]
      );
      if (normalTextureIndex !== -1) {
        textureParser += `(v.skin_index==${idx}${
          hasShiny ? " && query.property('pokeb:shiny') == false" : ""
        }) ? ${normalTextureIndex}:`;
      }

      if (!hasShiny) continue;

      // Shiny texture
      const shinyTextureIndex = textures.indexOf(
        `Texture.shiny_${variant}` as (typeof textures)[number]
      );
      if (shinyTextureIndex !== -1) {
        textureParser += `(v.skin_index==${idx}${
          hasShiny ? " && query.property('pokeb:shiny') == true" : ""
        }) ? ${shinyTextureIndex}:`;
      }
    }
  }

  // Fallback to first texture if nothing matches
  textureParser += "0";

  // Set the texture parser in the render controller
  rcFile.render_controllers[
    `controller.render.pokemon:${pokemonTypeId}`
  ].textures = [`Array.textureVariants[${textureParser}]`];

  // Register all changes to the render controller.
  rcFile.render_controllers[`controller.render.pokemon:${pokemonTypeId}`] =
    renderer;

  const geometryVariantsArray = ["default"].concat(
    Object.keys(customizations.skins ?? {}).filter((s) => {
      const skinOption = customizations.skins?.[s];
      if (!skinOption) return false;

      return skinOptionIncludes(skinOption, "model");
    })
  );

  if (
    geometryVariantsArray.length > 1 ||
    customizations.genderDifferences?.includes("model")
  ) {
    // Build the geometryParser for a pokemon with gender differences or custom skins.
    let geometryParser = "";

    // Check if we can use the simplified approach (direct skin_id index)
    const canUseSimplifiedApproach =
      !customizations.genderDifferences?.includes("model") &&
      geometryVariantsArray.every((variant, idx) => {
        // Check that each variant's position in geometryVariantsArray matches its position in geometries array
        const appearanceId = variant as AppearanceId;
        const geometryIdIndex = geometries.indexOf(`Geometry.${appearanceId}`);
        return geometryIdIndex === idx;
      });

    if (canUseSimplifiedApproach) {
      // We can use the simplified syntax
      geometryParser = "v.skin_index";
    } else {
      // Need to use the full ternary approach for gender differences or non-sequential indices
      for (const [idx, variant] of geometryVariantsArray.entries()) {
        if (customizations.genderDifferences?.includes("model")) {
          for (const gender of ["male", "female"]) {
            const appearanceId = `${gender}_${variant}` as AppearanceId;
            const geometryIdIndex = geometries.indexOf(
              `Geometry.${appearanceId}`
            );
            if (geometryIdIndex === -1) {
              // Remove Geometry from the `Array.geometryVariants`
              geometries = geometries.filter(
                (g) => g != "Geometry." + appearanceId
              );
              Logger.error(
                `Missing geometry for ${pokemonTypeId} with appearanceId: ${appearanceId}`
              );
              continue;
            }
            geometryParser += `(v.skin_index==${idx} && query.property('pokeb:gender')=='${gender}') ? ${geometryIdIndex}:`;
          }
        } else {
          const appearanceId = variant as AppearanceId;
          const geometryIdIndex = geometries.indexOf(
            `Geometry.${appearanceId}`
          );
          if (geometryIdIndex === -1) {
            // Remove Geometry from the `Array.geometryVariants`
            geometries = geometries.filter(
              (g) => g != "Geometry." + appearanceId
            );
            Logger.error(
              `Missing geometry for ${pokemonTypeId} with appearanceId: ${appearanceId}`
            );
            continue;
          }
          geometryParser += `(v.skin_index==${idx})?${geometryIdIndex}:`;
        }
      }

      // Append default geometry, if molang fails.
      geometryParser += "0";
    }

    // Set arrays.
    renderer.arrays.geometries["Array.geometryVariants"] = geometries;
    evoRender.arrays.geometries["Array.geometryVariants"] = geometries;
    renderer.arrays.materials["Array.materialVariants"] = materialVariants;

    // Set the geometry parser in the render controller.
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}`
    ].geometry = `Array.geometryVariants[${geometryParser}]`;
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}.evolve`
    ].geometry = `Array.geometryVariants[${geometryParser}]`;
  } else {
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}`
    ].geometry = `Geometry.default`;
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}.evolve`
    ].geometry = `Geometry.default`;
  }

  // If one of the skins has a different material, we need to add a material parser.
  if (materialVariants.length > 1) {
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}`
    ].materials = [
      {
        "*": "Array.materialVariants[v.skin_index]",
      },
    ];
  } else {
    rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}`
    ].materials = [{ "*": "Material.default" }];
  }

  if (!needsCustomEvoController(customizations)) {
    delete rcFile.render_controllers[
      `controller.render.pokemon:${pokemonTypeId}.evolve`
    ];
  }

  // Write the render controller file.
  try {
    const filePath = path.join(
      renderControllersPath,
      `${pokemonTypeId}.rc.json`
    );
    writeJsonFileSync(filePath, rcFile, { detectIndent: true });
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
    ...skinKeys.map((s) => `${pokemonTypeId}_${s}`),
  ];
  for (const sprite of sprites) {
    const spritePath = path.join(spriteDir, `${sprite}.png`);
    const darkSpritePath = path.join(darkSpriteDir, `${sprite}.png`);
    if (!fs.existsSync(spritePath)) {
      Logger.error(`Missing sprite for ${sprite} at ${spritePath}`);
      report.missingSprites.add(sprite);
      continue;
    }
    // Generate dark sprite if needed (check content, not just existence)
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
      const processedImageBuffer = await sharp(rawImageData, {
        raw: { width: metadata.width, height: metadata.height, channels: 4 },
      })
        .png()
        .toBuffer();

      const wasWritten = await writeImageIfChanged(
        darkSpritePath,
        processedImageBuffer
      );
      if (wasWritten) {
        Logger.info(`Dark sprite generated for ${sprite}!`);
      }
    } catch (error) {
      Logger.error(`Error processing image for ${sprite}: ${error}`);
    }
    // Update item textures
    itemTexturesFile!.texture_data[sprite] = {
      textures: spritePath.replace(/\\/g, "/"),
    };
  }
}

/**
 * Checks if the blink animation modifies bones other than the eyes.
 * Returns an array of problematic bone names if found, or null if no issues.
 */
function checkBlinkAnimation(pokemonTypeId: PokemonTypeId): string[] | null {
  const filePath = path.join(
    "animations",
    "pokemon",
    `${pokemonTypeId}.animation.json`
  );
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const animationFile = safeReadJSON<AnimationFile>(filePath);
  if (!animationFile || !animationFile.animations) {
    return null;
  }

  // Find the blink animation
  const blinkAnimKey = `animation.${pokemonTypeId}.blink`;

  // Use a type-safe approach to check if the key exists and get the animation
  let blinkAnimation: any = null;
  for (const key in animationFile.animations) {
    if (key === blinkAnimKey) {
      blinkAnimation =
        animationFile.animations[key as keyof typeof animationFile.animations];
      break;
    }
  }

  if (!blinkAnimation || !blinkAnimation.bones) {
    return null;
  }

  // Define valid eye-related bone name patterns
  const validBonePatterns = [
    // Specific bone names
    "eyes",
    "pupiles",
    "eyelids",
    "eyelid_left",
    "eyelid_right",
    "eye_left",
    "eye_right",
    "blinkle",
    "blinkre",
    "blinkright",
    "blinkleft",
    "blink_left",
    "blink_right",
    "leftblink1",
    "leftblink2",
    "rightblink1",
    "rightblink2",
    "RightBlink",
    "LeftBlink",
    "left_pupil",
    "right_pupil",
    "pupils",
    "closed",
    "opened",
    "iris",
    "iris2",
    "iris3",
    "Pupil2",
    "Pupil3",
    "lids",
    "lids2",

    // General patterns (for case-insensitive checks)
    "eye",
    "pupil",
    "eyelid",
    "blink",
    "iris",
  ];

  // Check which bones are modified
  const invalidBones: string[] = [];
  for (const boneName of Object.keys(blinkAnimation.bones)) {
    // Convert to lowercase for case-insensitive checks
    const lowerBoneName = boneName.toLowerCase();

    // Check if the bone name is in the valid patterns list or contains any of the pattern strings
    let isValid = false;
    for (const pattern of validBonePatterns) {
      if (pattern.length > 3) {
        // For specific full bone names, check exact match
        if (lowerBoneName === pattern.toLowerCase()) {
          isValid = true;
          break;
        }
      } else {
        // For general patterns, check if bone name contains the pattern
        if (lowerBoneName.includes(pattern.toLowerCase())) {
          isValid = true;
          break;
        }
      }
    }

    if (!isValid) {
      invalidBones.push(boneName);
    }
  }

  return invalidBones.length > 0 ? invalidBones : null;
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

        // Check blink animation
        const invalidBlinkBones = checkBlinkAnimation(typeId);
        if (invalidBlinkBones) {
          Logger.warn(
            `WARNING: Pokemon ${typeId} has a blink animation that modifies non-eye bones: ${invalidBlinkBones.join(
              ", "
            )}`
          );
          Logger.warn(
            `This can cause visible twitching during idle animations. Please fix the animation file.`
          );
          report.invalidBlinkAnimations.set(typeId, invalidBlinkBones);
        }

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
        if (hasModel && !needsCustomEvoController(customizations)) {
          entityFile[
            "minecraft:client_entity"
          ].description.render_controllers[1] = {
            "controller.render.evolve": "query.variant==1",
          };
        }
      } else if (hasModel) {
        // Fallback render controllers
        entityFile[
          "minecraft:client_entity"
        ].description.render_controllers[0] = {
          "controller.render.pokemon": "query.variant==0",
        };
        entityFile[
          "minecraft:client_entity"
        ].description.render_controllers[1] = {
          "controller.render.evolve": "query.variant==1",
        };
      }

      // Create animation controller if needed
      if (hasSkinSpecificAnimations(typeId)) makeAnimationController(typeId);

      const entityFilePath = path.join(
        pokemonEntityFilesDir,
        `${typeId}.entity.json`
      );
      writeJsonFileSync(entityFilePath, entityFile, { detectIndent: true });
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
    writeJsonFileSync(itemTexturesPath, itemTexturesFile, {
      detectIndent: true,
    });

    // Generate markdown report.
    let markdownContent = `# Missing Information Report\n\nThis report contains details about missing or problematic elements found during the Pokémon processing.\n\n`;
    markdownContent += `## Pokémon Missing Geometry Files\n`;
    if (report.missingGeometryFiles.size > 0) {
      report.missingGeometryFiles.forEach((id) => {
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
    markdownContent += `\n## Pokémon With Problematic Blink Animations\n`;
    if (report.invalidBlinkAnimations.size > 0) {
      markdownContent += `These Pokémon have blink animations that modify bones other than "eyes" or bones with "eye" in their name.\nThis can cause visible twitching when Pokémon are idle or when blink animation is triggered.\n\n`;
      report.invalidBlinkAnimations.forEach((bones, id) => {
        markdownContent += `- [${id}](animations/pokemon/${id}.animation.json): Modifies non-eye bones: ${bones.join(
          ", "
        )}\n`;
      });
    } else {
      markdownContent +=
        "No Pokémon have problematic blink animations that modify non-eye bones!\n";
    }
    const markdownWritten = writeFileIfChanged(
      markdownLogPath,
      markdownContent
    );
    if (markdownWritten) {
      Logger.info(`Markdown report updated at ${markdownLogPath}`);
    }
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
