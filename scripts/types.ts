import type pokemonJson from "../pokemon.json";
export type PokemonTypeId = keyof (typeof pokemonJson)["pokemon"];
import type { PokemonCustomization } from "./data/customizations";
import type { MaterialId } from "./data/material.types";
export type {
  VanillaMaterial,
  CustomMaterial,
  MaterialId,
} from "./data/material.types";

export interface PokemonJsonContent {
  /**
   * Pokemon In PokeBedrock that have Models
   * @key PokemonName -> @value Types
   */
  pokemonWithModels: Partial<PokemonTypeId>[];
  /**
   * Pokemon In PokeBedrock that are Without Models
   * @key PokemonName -> @value Types
   */
  pokemon: {
    [key in PokemonTypeId]: {
      name: string;
      canMount: boolean;
      behavior: {
        canMove: boolean;
        canWalk: boolean;
        canSwim: boolean;
        canFly: boolean;
        canLook: boolean;
        canSleep: boolean;
      };
    };
  };
}

type format_version = `${number}.${number}.${number}`;
type Vector3 = [number, number, number];
type Vector2 = [number, number];
/**
 * This needs to be a valid molang string.
 */
type Molang = string;

export interface EntityFile {
  format_version: format_version;
  "minecraft:client_entity": {
    description: {
      identifier: string;
      materials: { [key: string]: string };
      textures: { [key: string]: string };
      geometry: { [key: string]: string };
      scripts: {
        animate?: (string | { [key: string]: string })[];
      };
      animations: { [key: string]: string };
      particle_effects: { [key: string]: string };
      render_controllers: { [key: string]: string }[];
      spawn_egg: {
        texture: string;
        texture_index: number;
      };
    };
  };
}

interface GeometryFileBoneCube {
  origin: Vector3;
  size: Vector3;
  inflate: number;
  pivot: Vector3;
  rotation: Vector3;
  uv: Vector2;
}

interface GeometryFileBone {
  name: string;
  parent: string;
  pivot: Vector3;
  cubes: GeometryFileBoneCube[];
}

interface GeometryFileGeometry {
  description: {
    identifier: `geometry.${string}`;
    texture_width: number;
    texture_height: number;
    visible_bounds_width: number;
    visible_bounds_height: number;
    visible_bounds_offset: Vector3;
  };
  bones: GeometryFileBone[];
}

export interface GeometryFile {
  format_version: format_version;
  "minecraft:geometry": GeometryFileGeometry[];
}

interface AnimationFileAnimationBoneKeyframe {
  post: Vector3;
  lerp_mode: "catmullrom" | "linear";
}

type AnimationFileAnimationBoneKeyframes = {
  [key: `${number}.${number}`]: AnimationFileAnimationBoneKeyframe | Vector3;
};

interface AnimationFileAnimationBone {
  rotation: AnimationFileAnimationBoneKeyframes;
  position: AnimationFileAnimationBoneKeyframes;
  scale: AnimationFileAnimationBoneKeyframes;
}

interface AnimationFileParticleEffect {
  effect: string;
  locator: string;
}
interface AnimationFileAnimation {
  loop: boolean;
  animation_length: number;
  override_previous_animation: boolean;
  bones: { [key: string]: AnimationFileAnimationBone };
  particle_effects?: {
    [key: `${number}.${number}`]: AnimationFileParticleEffect;
  };
}

export const PokemonAnimationTypes = [
  "flying",
  "air_idle",
  "swimming",
  "water_idle",
  "walking",
  "ground_idle",
  "sleeping",
  "blink",
  "attack",
  "faint",
] as const;

export type PokemonAnimationKey =
  `animation.${PokemonTypeId}.${(typeof PokemonAnimationTypes)[number]}`;

export interface AnimationFile {
  format_version: format_version;
  animations: Partial<Record<PokemonAnimationKey, AnimationFileAnimation>>;
}

interface RenderControllerFileRenderer {
  arrays: {
    materials:
      | { [key: string]: string }
      | {
          "Array.materialVariants": `Material.${string}`[];
        };
    textures:
      | { [key: string]: string }
      | {
          "Array.textureVariants": `Texture.${string}`[];
        };
    geometries:
      | { [key: string]: string }
      | {
          "Array.geometryVariants": `Geometry.${string}`[];
        };
  };
  geometry: `Geometry.${string}` | Molang;
  materials: [
    {
      "*": string | "Material.default";
    }
  ];
  textures: string[] | [Molang];
  uv_anim?: {
    offset: [number | Molang, number | Molang];
    scale: [number | Molang, number | Molang];
  };
}
export interface RenderControllerFile {
  format_version: format_version;
  render_controllers: {
    [key: `controller.render.${string}`]: RenderControllerFileRenderer;
  };
}

interface AnimationControllerState {
  animations?: (string | { [key: string]: string })[];
  transitions?: { [key: string]: string }[];
  blend_transition?: number;
}

export interface AnimationControllerFile {
  format_version: format_version;
  animation_controllers: {
    [key: `controller.animation.${string}`]: {
      initial_state: string;
      states: {
        [key: string]: AnimationControllerState;
      };
    };
  };
}

export interface ItemTextureFile {
  resource_pack_name: string;
  texture_name: string;
  texture_data: {
    [key: string]: {
      textures: string[] | string;
    };
  };
}

export interface IItemsJson {
  [key: `pokeb:${string}`]: string;
}

/**
 * A array of differences in a pokemon's display that need to be taken account for generation.
 * This is only relevant for pokemon that don't have a different identifier in-game. For example
 * this would apply to venusaur, but not to Meowstic as it already has a different typeId: `pokemon:mewosticf`.
 *
 * This should only apply to a pokemon if it can spawn in different genders. For example `petilil` will not be in
 * this list as it is always Female, but `combee` will be in this list as it can be either male or female.
 *
 * The differences are:
 * - texture: The texture of the pokemon is different.
 *      @example: Butterfree has a different texture in which
 *               the Female has black (purple in Generation V) spots on her lower wings.
 *      File Names (in `./textures/entity/pokemon/pokemon_name/`):
 *          - `male_{pokemonId}.png`
 *          - `male_shiny_{pokemonId}.png`
 *          - `female_{pokemonId}.png`
 *          - `female_shiny_{pokemonId}.png`
 *      Note: If a pokemon has a model difference, a texture difference is inherited. Also
 *            if the pokemon has any skins, the skin must have a variant too for genders.
 *            For Example: `male_{pokemonId}_{skinId}.png`
 *  - model: The model of the pokemon is different.
 *      @example: Venusaur has a different model in which the
 *                Female's flower has a visible gynoecium (seed-producing organ).
 *      File Names (in `./models/pokemon/`):
 *         - `male_{pokemonId}.geo.json`
 *         - `female_{pokemonId}.geo.json`
 * - animation_{id}: The animation `animation.{pokemonID}.{id}` for the pokemon is different for this model.
 *     @example: Female Kirlia has a different `walking` animation that is more delicate compared to males.
 *               In which `animation_walking` should be added.
 *      Animation ID Names (in `./animations/pokemon/{pokemonId}.animation.json`):
 *          - `animation.{pokemonID}.male_{id}`
 *          - `animation.{pokemonID}.female_{id}`
 * - sound: The sound of the pokemon is different. This is usually for pokemon with a cry difference.
 *     @example The male and female forms of Unfezant have noticeably different cries in the games.
 *      File Names (in `./sounds/mob/pokemon/`):
 *        - `male_{pokemonId}.ogg`
 *        - `female_{pokemonId}.ogg`
 */
export type PokemonAppearanceDifferences = (
  | "texture"
  | "shiny_texture"
  | "model"
  | "sound"
  | `animation_${(typeof PokemonAnimationTypes)[number]}`
  | "animations"
)[];

/**
 * The config for how this texture should be animated.
 * the first index is the number of frames in the texture.
 * the second index is the speed of the animation (in FPS).
 */
export type AnimatedTextureConfig = [number, number];

/**
 * Represents a particle effect ID in the format "namespace:path"
 * Used for defining particle effects in animations and skins
 */
export type ParticleEffectId = `${"minecraft" | "pokeb"}:${string}`;

/**
 * Represents the object form of a Pokemon skin option with enhanced capabilities
 */
export interface PokemonSkinOptionObject {
  differences: PokemonAppearanceDifferences;
  /**
   * If this skin uses a animated texture to display.
   * This will override the parent's animatedTextureConfig when this skin is selected.
   */
  animatedTextureConfig?: AnimatedTextureConfig;
  /**
   * An array of particle effects this skin uses in its animations
   * This will override or supplement the parent's animationParticleEffects when this skin is selected.
   */
  animationParticleEffects?: ParticleEffectId[];
  /**
   * Overrides the material used when this skin is selected.
   * If omitted, will fall back to parent material or animated texture material.
   *
   * NOTE: If this skin also uses an animated texture {@link animatedTextureConfig}, and you
   * set a custom material here, that custom material must support animated textures.
   * To do so, inherit/add the animated texture define 'USE_UV_ANIM' in your material.
   */
  material?: MaterialId;
}

export type GeometryFileName =
  | PokemonTypeId // Base form
  | `male_${PokemonTypeId}` // Male form
  | `female_${PokemonTypeId}` // Female form
  | `${PokemonTypeId}_${keyof PokemonCustomization["skins"]}` // Skin form
  | `male_${PokemonTypeId}_${keyof PokemonCustomization["skins"]}` // Male skin form
  | `female_${PokemonTypeId}_${keyof PokemonCustomization["skins"]}`; // Female skin form

export interface RenderController {
  format_version: string;
  "minecraft:render_controller": {
    geometry: string;
    materials: Array<{
      "*": string;
    }>;
    textures: string[];
    arrays?: {
      geometries?: {
        "Array.geometries": string[];
      };
      textures?: {
        "Array.textures": string[];
      };
    };
    renderer_arrays?: Array<{
      "Array.geometries"?: {
        "*": string;
      };
      "Array.textures"?: {
        "*": string;
      };
    }>;
  };
}

/**
 * Utility type that generates a sequence of numbers from 0 to N-1
 */
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

/**
 * Utility type representing a range of numbers from F to T inclusive
 */
export type Range<F extends number, T extends number> =
  | Exclude<Enumerate<T>, Enumerate<F>>
  | T;
