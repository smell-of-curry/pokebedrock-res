export interface PokemonJsonContent {
  /**
   * Pokemon In PokeBedrock that have Models
   * @key PokemonName -> @value Types
   */
  pokemonWithModels: string[];
  /**
   * Pokemon In PokeBedrock that are Without Models
   * @key PokemonName -> @value Types
   */
  pokemon: {
    [key: string]: {
      name: string;
      genderless: boolean;
      skins: string[];
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

interface AnimationFileAnimation {
  loop: boolean;
  animation_length: number;
  override_previous_animation: boolean;
  bones: { [key: string]: AnimationFileAnimationBone };
}

export interface AnimationFile {
  format_version: format_version;
  animations: {
    [key: `animation.${string}.${string}`]: AnimationFileAnimation;
  };
}

interface RenderControllerFileRenderer {
  arrays: {
    textures:
      | { [key: string]: string }
      | {
          "Array.variants": `Texture.${string}`[];
        };
  };
  geometry: `Geometry.${string}`;
  materials: [
    {
      "*": "Material.default";
    }
  ];
  textures: string[];
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

export interface ItemTextureFile {
  resource_pack_name: string;
  texture_name: string;
  texture_data: {
    [key: string]: {
      textures: string[] | string;
    };
  };
}
