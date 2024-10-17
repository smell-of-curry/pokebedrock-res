/**
 * The config for how this texture should be animated.
 * the first index is the number of frames in the texture.
 * the second index is the speed of the animation (in FPS).
 */
type AnimatedTextureConfig = [number, number];

/**
 * Holds a object containing all the pokemon who require animated textures
 * on the entity model.
 */
export const ANIMATED_TEXTURED_POKEMON: {
  [key: string]: AnimatedTextureConfig;
} = {
  golurk: [3, 8],
  golurkhalloween: [3, 8],
};
