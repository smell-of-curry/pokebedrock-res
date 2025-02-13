import type pokemon from "../../pokemon.json";
import { PokemonTypeId } from "../types";

/**
 * A array of differences in a pokemon's display that need to be taken account for generation.
 * This is only relevant for pokemon that don't have a different identifier in-game. For example
 * this would apply to venusaur, but not to Meowstic as it already has a different typeID `pokemon:mewosticf`.
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

/**
 * A array of differences in a pokemon's display that need to be taken into account for generation.
 *
 * The differences are:
 * - "texture": color or pattern difference
 * - "model": shape or geometry difference
 * - "sprite": if the 2D sprite is distinct (often implied if "texture" or "model" differs, but sometimes separate)
 * - "sound": the cry is different
 * - `animation_{id}`: a named animation difference
 */
type PokemonGenderDifferences = (
  | "texture"
  | "model"
  | "sprite"
  | "sound"
  | `animation_${string}`
)[];

/**
 * Comprehensive list of Pokémon with known gender differences, in National Dex order.
 */
export const POKEMON_GENDER_DIFFERENCES: Partial<{
  [pokemonId in PokemonTypeId]: PokemonGenderDifferences;
}> = {
  // -- Gen 1 --------------------------------------
  /**
   * Female's flower has a visible gynoecium
   */
  venusaur: ["model"],

  /**
   * Female has black (purple in Gen V) spots on her lower wings
   */
  butterfree: ["texture"],

  /**
   * Female has smaller whiskers
   */
  rattata: ["model"],
  raticate: ["model"],

  /**
   * Female tail lacks a point and is smaller
   */
  raichu: ["texture"],

  /**
   * Female's tail ends in the upper half of a heart (Gen IV onward)
   */
  pikachu: ["texture"],
  // If you have special forms for Pikachu (e.g. original cap, Hoenn cap, etc.),
  // you can replicate these differences:
  pikachuoriginal: ["texture"],
  pikachuhoenn: ["texture"],
  pikachualola: ["texture"],

  /**
   * Female has smaller fangs
   */
  zubat: ["model"],
  golbat: ["model"],

  /**
   * Female has one large spot per petal (Gloom),
   * Female's petals have larger spots (Vileplume)
   */
  gloom: ["texture"],
  vileplume: ["texture"],

  /**
   * Female has slightly thinner whiskers
   */
  kadabra: ["texture"],
  alakazam: ["texture"],

  /**
   * Female has fewer neck stripes
   */
  doduo: ["texture"],
  dodrio: ["texture"],

  /**
   * Female's collar fur is shorter
   */
  hypno: ["texture"],

  /**
   * Female horn is slightly shorter
   */
  rhyhorn: ["model"],
  rhydon: ["model"],

  /**
   * Female's horn is shorter
   */
  goldeen: ["model"],
  /**
   * Female has smaller dorsal fin
   */
  seaking: ["model"],

  /**
   * Female abdomen is larger and has a more rounded shape
   */
  scyther: ["model"],

  /**
   * Female whiskers are white (male's are yellow)
   */
  magikarp: ["texture"],
  /**
   * Female has shorter barbels
   */
  gyarados: ["texture"],

  // -- Gen 2 --------------------------------------
  /**
   * Female has a different tail pattern (subtle)
   */
  eevee: ["texture"],

  /**
   * Female's body color is more vivid, ear/tail shapes can differ
   */
  marill: ["texture"],
  azumarill: ["texture"],

  /**
   * Female has smaller horns
   */
  girafarig: ["model"],

  /**
   * Female's horn is heart-shaped at the tip
   */
  heracross: ["model"],

  /**
   * Female's left ear is shorter (already in your snippet)
   */
  sneasel: ["texture"],

  /**
   * Female's shoulder fur is smaller
   */
  ursaring: ["texture"],

  /**
   * Female has lipstick-like mouth
   */
  wobbuffet: ["texture"],

  /**
   * Female's suction cups have a slightly different pattern
   */
  octillery: ["texture"],

  /**
   * The antennae are shorter on the female than on the male
   */
  ledian: ["texture"],

  /**
   * Female has one set of gill branches
   */
  wooper: ["texture"],
  /**
   * Female has a smaller dorsal ridge
   */
  quagsire: ["texture"],

  // -- Gen 3 --------------------------------------
  /**
   * Female's petals are bigger on the head
   */
  lotad: ["texture"],
  /**
   * Female has bigger swirl
   */
  spinda: ["texture"], // Also sometimes not considered a pure gender difference, because spinda has randomized patterns

  // ... (Many Gen 3 Pokémon do NOT have big differences) ...
  /**
   * Female's left pincer is slightly smaller
   */
  corphish: ["model"],
  crawdaunt: ["model"],

  // -- Gen 4 --------------------------------------
  /**
   * Female's color pattern is inverted
   */
  hippopotas: ["texture", "sprite"],
  hippowdon: ["texture", "sprite"],

  /**
   * Female has longer cape
   */
  roserade: ["model", "texture"],

  /**
   * Only female evolves, and the female middle face marking is red
   */
  combee: ["texture"],

  /**
   * Female’s appearance and cry differ
   */
  unfezant: ["texture", "sound"],

  /**
   * Male has a large mane; female has a smaller tuft
   */
  pyroar: ["model", "texture"],

  /**
   * Female’s face pattern differs (male has more dark area on face)
   */
  bidoof: ["texture"],
  bibarel: ["texture"],

  /**
   * Males have a slightly longer head crest
   */
  starly: ["texture"],
  staravia: ["texture"],
  staraptor: ["texture"],

  /**
   * Male has more fur around its legs; female has slightly less
   */
  shinx: ["texture"],
  luxio: ["texture"],
  luxray: ["texture"],

  /**
   * Female's shell dome has slightly smaller spikes
   */
  turtwig: ["model"],
  grotle: ["model"],
  torterra: ["model"],

  /**
   * Female's eyebrow tufts are smaller
   */
  chimchar: ["texture"],
  monferno: ["texture"],
  infernape: ["texture"],

  /**
   * Female's cape-like pattern is shorter
   */
  piplup: ["texture"],
  prinplup: ["texture"],
  empoleon: ["texture"],

  /**
   * Female has a bigger head swirl
   */
  buneary: ["texture"],
  lopunny: ["texture"],

  /**
   * Female’s spots on the body differ
   */
  buizel: ["texture"],
  floatzel: ["texture"],

  /**
   * Female's shell top is different (slight color difference)
   */
  shellos: ["texture"],
  gastrodon: ["texture"],

  /**
   * Female's tail scarf is shorter
   */
  glameow: ["texture"],
  purugly: ["texture"],

  /**
   * Female’s stench cloud marking is smaller
   */
  stunky: ["texture"],
  skuntank: ["texture"],

  /**
   * Female has smaller lumps on the front
   */
  bronzor: ["texture"], // Though bronzor is usually symmetrical; some references mention a slight difference
  bronzong: ["texture"],

  /**
   * Female has a smaller stripe on the center
   */
  gible: ["texture"],
  gabite: ["texture"],
  garchomp: ["texture"],
  garchomphalloween: ["texture"],

  /**
   * Female's pattern is inverted on the body segments
   */
  skorupi: ["texture"],
  drapion: ["texture"],

  /**
   * Female cheek pouches are smaller
   */
  croagunk: ["texture"],
  toxicroak: ["texture"],

  /**
   * Female fins differ in shape
   */
  finneon: ["texture"],
  lumineon: ["texture"],

  /**
   * Female's ruff is smaller
   */
  snover: ["texture"],
  abomasnow: ["texture"],

  // -- Gen 5 --------------------------------------
  /**
   * Female crest is smaller
   */
  patrat: ["texture"],
  watchog: ["texture"],

  /**
   * Female has smaller face pattern
   */
  lillipup: ["texture"],
  herdier: ["texture"],
  stoutland: ["texture"],

  /**
   * Female has more eyelashes
   */
  purrloin: ["texture"],
  liepard: ["texture"],

  /**
   * Females have different tuft shapes on the front
   */
  pansage: ["texture"],
  simisage: ["texture"],
  pansear: ["texture"],
  simisear: ["texture"],
  panpour: ["texture"],
  simipour: ["texture"],

  /**
   * Female's heart shape on chest is smaller
   */
  munna: ["texture"],
  musharna: ["texture"],

  /**
   * Female has bigger marking on head
   */
  pidove: ["texture"],
  tranquill: ["texture"],
  // Unfezant is above

  /**
   * Female mane is smaller
   */
  blitzle: ["texture"],
  zebstrika: ["texture"],

  /**
   * Female's tuft is smaller
   */
  roggenrola: ["texture"],
  boldore: ["texture"],
  gigalith: ["texture"],

  /**
   * Female has smaller nose
   */
  woobat: ["texture"],
  swoobat: ["texture"],

  /**
   * Female has smaller vein patterns
   */
  drilbur: ["texture"],
  excadrill: ["texture"],

  /**
   * Female’s pigtails are smaller (this is a big maybe—Audino’s differences can be subtle)
   */
  audino: ["texture"],

  /**
   * Male has a vein-like bulge in the muscle, female's is less pronounced
   */
  timburr: ["model"],
  gurdurr: ["model"],
  conkeldurr: ["model"],

  /**
   * Female’s vocal sac is smaller
   */
  tympole: ["texture"],
  palpitoad: ["texture"],
  seismitoad: ["texture"],

  /**
   * Throh and Sawk have subtle differences in belt or chest width
   */
  throh: ["texture"],
  sawk: ["texture"],

  // (Many more Gen 5 can have minor pattern differences; continuing with the major ones)

  /**
   * Female has smaller collar leaves
   */
  sewaddle: ["texture"],
  swadloon: ["texture"],
  leavanny: ["texture"],

  /**
   * Female’s segmented shell is smaller
   */
  venipede: ["texture"],
  whirlipede: ["texture"],
  scolipede: ["texture"],

  /**
   * Female’s “fluff” is smaller
   */
  cottonee: ["texture"],
  whimsicott: ["texture"],

  /**
   * Male has bigger whiskers
   */
  basculin: ["texture"],
  basculinbluestriped: ["texture"],
  basculinwhitestriped: ["texture"],

  /**
   * Female has smaller black stripes
   */
  sandile: ["texture"],
  krokorok: ["texture"],
  krookodile: ["texture"],
  // ...

  /**
   * Female has bigger drooping eyebrows
   */
  darumaka: ["texture"],
  darmanitan: ["texture"],
  // ...

  /**
   * Female's “pants” marking smaller
   */
  scraggy: ["texture"],
  scrafty: ["texture"],
  // ...

  /**
   * Female has shorter ear tufts
   */
  minccino: ["texture"],
  cinccino: ["texture"],

  /**
   * Female has bigger eyelashes
   */
  gothita: ["texture"],
  gothorita: ["texture"],
  gothitelle: ["texture"],

  // ...
  /**
   * Female chest marking is smaller
   */
  ducklett: ["texture"],
  swanna: ["texture"],

  /**
   * Female has bigger spots
   */
  deerling: ["texture"], // All forms
  sawsbuck: ["texture"],

  /**
   * Female veil marking is smaller
   */
  frillish: ["texture"],
  jellicent: ["texture"],
  // ...

  /**
   * Female has smaller jaw pattern
   */
  alomomola: ["texture"],
  // ...

  /**
   * Female paw spikes are smaller
   */
  joltik: ["texture"],
  galvantula: ["texture"],
  // ...

  /**
   * Female’s horns are shorter
   */
  ferroseed: ["model"],
  ferrothorn: ["model"],
  // ...

  /**
   * Female’s mouth pattern is smaller
   */
  karrablast: ["texture"],
  escavalier: ["texture"],

  /**
   * Female's hair tuft is smaller
   */
  foongus: ["texture"],
  amoonguss: ["texture"],

  // -- Gen 6 --------------------------------------
  /**
   * Female tail is smaller
   */
  fletchling: ["texture"],
  fletchinder: ["texture"],
  talonflame: ["texture"],

  /**
   * Female’s whiskers are shorter
   */
  litleo: ["texture"],
  // pyroar is above

  /**
   * Female’s ear swirl is smaller
   */
  furfrou: ["texture"],

  /**
   * Male horns are bigger
   */
  skiddo: ["model"],
  gogoat: ["model"],

  /**
   * Female’s ear tufts are shorter
   */
  espurr: ["texture"],
  // meowstic has separate IDs

  /**
   * Female has a rounder pumpkin shape
   */
  pumpkaboo: ["model"],
  gourgeist: ["model"],

  // -- Gen 7/8/9 --------------------------------------
  // None
};
