/**
 * A array of differences in a pokemon's display that need to be taken account for generation.
 * This is only relevant for pokemon that don't have a diffrent identifier in-game. For example
 * this would apply to venusaur, but not to Meowstic as it has a `pokemon:mewosticf` type too.
 *
 * The differences are:
 * - texture: The texture of the pokemon is different.
 *      @example: Butterfree has a different texture in which
 *               the Female has black (purple in Generation V) spots on her lower wings.
 *      File Names (in `./textures/entity/pokemon/pokemon_name/`):
 *          - `male_{pokemonId}.png`
 *          - `female_{pokemonId}.png`
 *          - `shiny_male_{pokemonId}.png`
 *          - `shiny_female_{pokemonId}.png`
 *      Note: If a pokemon has a model difference, a texture difference is inherited. Also
 *            if the pokemon has any skins, the skin must have a variant too for genders.
 *            For Example: `male_{pokemonId}_{skinId}.png`
 *  - model: The model of the pokemon is different.
 *      @example: Venusaur has a different model in which the
 *                Female's flower has a visible gynoecium (seed-producing organ).
 *      File Names (in `./models/pokemon/`):
 *         - `male_{pokemonId}.geo.json`
 *         - `female_{pokemonId}.geo.json`
 * - sprite: The sprite of the pokemon is different. Important for pokemon without models.
 *           Usually any pokemon with model difference or texture difference, should have this too,
 *           but it's not always the case that the change is noticeable in the sprite.
 *      @example: Hippopotas has a different sprite in which the Female's color pattern is inverted.
 *      File Names (in `./textures/sprites/default/`):
 *          - `male_{pokemonId}.png`
 *          - `female_{pokemonId}.png`
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
type PokemonGenderDifferences = (
  | "texture"
  | "model"
  | `animation_${string}`
  | "sprite"
  | "sound"
)[];

export const POKEMON_GENDER_DIFFERENCES: {
  [key: string]: PokemonGenderDifferences;
} = {
  //   /**
  //    * Female's flower has a visible gynoecium
  //    */
  //   venusaur: ["model"],
  //   /**
  //    * Female has black (purple in Generation V) spots on her lower wings
  //    */
  //   butterfree: ["texture"],
  //   /**
  //    * Female has smaller whiskers
  //    */
  //   rattata: ["model"],
  //   raticate: ["model"],
  //   /**
  //    * Female has smaller fangs
  //    */
  //   zubat: ["model"],
  //   golbat: ["model"],
  //   /**
  //    * Female has one large spot per petal
  //    */
  //   gloom: ["texture"],
  //   /**
  //    * Female's petals have larger spots
  //    */
  //   vileplume: ["texture"],
  /**
   * Male has a notched dorsal fin
   */
  gible: ["texture"],
  gabite: ["texture"],
  garchomp: ["texture"],
  garchomphalloween: ["texture"],
  /**
   * Female's left ear is shorter
   */
  sneasel: ["texture"],
  /**
   * Female's tail lacks a point and is smaller
   */
  raichu: ["texture"],
  /**
   * Female's tail ends in the upper half of a heart
   */
  pikachuoriginal: ["texture"],
  pikachuhoenn: ["texture"],
  pikachualola: ["texture"],
  pikachu: ["texture"],
};
