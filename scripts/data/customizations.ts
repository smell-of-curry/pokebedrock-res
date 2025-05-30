import { match } from "assert";
import type {
  AnimatedTextureConfig,
  PokemonAppearanceDifferences,
  PokemonTypeId,
  ParticleEffectId,
  PokemonSkinOptionObject,
} from "../types";

/**
 * Defines customization options for a Pokémon skin.
 * Use the array form for simple skins that only need different assets.
 * Use the object form when you need custom animations or particle effects that are specific to the skin.
 */
export type PokemonSkinOption =
  | PokemonAppearanceDifferences
  | PokemonSkinOptionObject;

export interface PokemonCustomization {
  /**
   * An object that contains the skins for the pokemon.
   * The key is a typeId of the skin that will suffix the pokemon typeId.
   *
   * @example @key "halloween" - Which if the pokemon is sandshrew, the typeId will be "sandshrewhalloween"
   *
   * An array of differences that this skin will require to display properly.
   * For example, Pikachu-Witch will need a different model, and therefore texture, to display the hat.
   * Which means it should be mapped to: ["model", "texture"].
   * Also if this skin uses a different sound, sprite, or animation, it should be added here.
   */
  skins?: { [key: string]: PokemonSkinOption };
  /**
   * If the pokemon has a different look based on what gender it is.
   */
  genderDifferences?: PokemonAppearanceDifferences;
  /**
   * If this appearance uses a animated texture to display.
   * Map to a animated texture config.
   * This applies to the default form and all skins unless a skin defines its own animatedTextureConfig.
   */
  animatedTextureConfig?: AnimatedTextureConfig;
  /**
   * An array of particle effects this pokemon uses in its animations
   * Where the effect ID will be the second string after the split of ":"
   * This applies to the default form and all skins unless a skin defines its own animationParticleEffects.
   *
   * @example "pokeb:poison_smoke" -> poison_smoke: "pokeb:poison_smoke"
   */
  animationParticleEffects?: ParticleEffectId[];
}

/**
 * Pokemon Customizations:
 *
 * This file is supposed to be the place where all resource sided customizations on pokemon
 * lives. For example, if a pokemon has an animated texture, has a different look based on
 * its gender and even for defining skins for each pokemon.
 *
 * If a pokemon in this list, it requires some type of customization out of the norm.
 * Which will be handled by the pokemon generator.
 */
export const PokemonCustomizations: Partial<{
  [key in PokemonTypeId]: PokemonCustomization;
}> = {
  // ======================== GEN 1 ========================

  charmander: {
    animationParticleEffects: ["pokeb:tail_flame"],
  },

  dewgong: {
    animationParticleEffects: ["pokeb:splash"],
  },

  torterra: {
    skins: {
      stpatrick: {
        differences: [
          "model",
          "texture",
          "shiny_texture",
          "animation_ground_idle",
          "animation_walking",
          "animation_water_idle",
          "animation_swimming",
          "animation_sleeping",
          "animation_attack",
          "animation_faint",
        ],
        animatedTextureConfig: [3, 8],
      },
    },
  },

  /** Female's flower has a visible gynoecium */
  venusaur: {
    genderDifferences: ["model"],
  },

  /** Female has black (purple in Gen V) spots on her lower wings */
  butterfree: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller whiskers */
  rattata: {
    genderDifferences: ["model"],
  },
  raticate: {
    genderDifferences: ["model"],
  },

  /** Female tail lacks a point and is smaller */
  raichu: {
    genderDifferences: ["texture"],
  },

  ponyta: {
    animatedTextureConfig: [3, 8],
  },
  rapidash: {
    animatedTextureConfig: [3, 8],
  },

  /** Female's tail ends in upper half of heart (Gen IV+) */
  pikachu: {
    skins: {
      witch: ["texture"],
      captin: ["texture"],
      santa: ["texture"],
      detective: ["texture"],
      doll: ["texture"],
    },
    genderDifferences: ["texture"],
  },
  pikachualola: {
    genderDifferences: ["texture"],
  },
  pikachuhoenn: {
    genderDifferences: ["texture"],
  },
  pikachuoriginal: {
    genderDifferences: ["texture"],
  },

  sandshrew: {
    skins: {
      halloween: ["model", "texture"],
    },
  },
  sandslash: {
    skins: {
      halloween: ["model", "texture"],
    },
  },

  /** Female has smaller fangs */
  zubat: {
    genderDifferences: ["model"],
  },
  golbat: {
    genderDifferences: ["model"],
  },

  spinda: {
    skins: {
      bowties: ["texture", "shiny_texture"],
      facescar: ["texture", "shiny_texture"],
      doubleganger: ["texture", "shiny_texture"],
      dots: ["texture", "shiny_texture"],
      glasses: ["texture", "shiny_texture"],
      eyebrows: ["texture", "shiny_texture"],
      smallking: ["texture", "shiny_texture"],
      heart: ["texture", "shiny_texture"],
    },
  },

  /** Female has one large spot per petal */
  gloom: {
    genderDifferences: ["texture"],
  },
  vileplume: {
    genderDifferences: ["texture"],
  },

  /** Female has a smaller mustache */
  kadabra: {
    genderDifferences: ["texture"],
  },
  alakazam: {
    genderDifferences: ["texture"],
  },

  /** Female has a beige neck */
  doduo: {
    genderDifferences: ["texture"],
  },
  dodrio: {
    genderDifferences: ["texture"],
  },

  /** Female has a longer collar fur */
  hypno: {
    genderDifferences: ["texture"],
  },

  /** Female horn slightly shorter */
  rhyhorn: {
    genderDifferences: ["model"],
  },
  rhydon: {
    genderDifferences: ["model"],
  },

  /** Female's horn is shorter */
  goldeen: {
    genderDifferences: ["model"],
  },
  /* Female's horn is shorter */
  seaking: {
    genderDifferences: ["model"],
  },

  /** Female abdomen larger/more rounded */
  scyther: {
    genderDifferences: ["model"],
  },

  /** Female whiskers white */
  magikarp: {
    genderDifferences: ["texture"],
  },
  /* Female has white whiskers, male has blue whiskers */
  gyarados: {
    genderDifferences: ["texture"],
  },
  gyaradosmega: {
    genderDifferences: ["texture"],
  },

  /** Female has different tail pattern */
  eevee: {
    genderDifferences: ["texture"],
  },

  mew: {
    skins: {
      christmas: ["model", "texture"],
    },
  },
  mewtwo: {
    skins: {
      shadow: ["texture"],
      armored: ["texture"],
    },
  },
  mewtwomegax: {
    skins: {
      shadow: ["texture"],
    },
  },
  mewtwomegay: {
    skins: {
      shadow: ["texture"],
    },
  },

  meowscarada: {
    skins: {
      valentine: ["model", "texture"],
    },
  },

  koffing: {
    animationParticleEffects: ["pokeb:poison_smoke"],
  },

  weezing: {
    animationParticleEffects: ["pokeb:poison_smoke"],
  },

  // ======================== GEN 2 ========================

  celebi: {
    skins: {
      halloween: ["model", "texture", "shiny_texture"],
    },
  },

  vivillon: {
    skins: {
      archipelago: ["texture"],
      continental: ["texture"],
      elegant: ["texture"],
      garden: ["texture"],
      high_plains: ["texture"],
      icy_snow: ["texture"],
      jungle: ["texture"],
      marine: ["texture"],
      modern: ["texture"],
      monsoon: ["texture"],
      ocean: ["texture"],
      polar: ["texture"],
      river: ["texture"],
      sandstorm: ["texture"],
      savanna: ["texture"],
      sun: ["texture"],
      tundra: ["texture"],
      valentine: ["texture"],
    },
  },

  /** Female's body has a larger yellow section */
  girafarig: {
    genderDifferences: ["model"],
  },

  /** Male has longer antennae */
  meganium: {
    genderDifferences: ["model"],
  },

  /** Male has three yellow body stripes */
  xatu: {
    genderDifferences: ["model"],
  },

  /** Female's head branch is smaller */
  sudowoodo: {
    genderDifferences: ["model"],
  },

  /** Female has smaller red cheeks */
  politoed: {
    genderDifferences: ["model"],
  },

  /** Male has shorter head fur */
  aipom: {
    genderDifferences: ["model"],
  },

  /** Female's hate-like plumage is smaller */
  murkrow: {
    genderDifferences: ["model"],
  },

  /** Female has smaller tail stinger */
  gligar: {
    genderDifferences: ["model"],
  },

  /** Male lacks an outer tooth on each side */
  steelix: {
    genderDifferences: ["model"],
  },

  /** Female abdomen larger */
  scizor: {
    genderDifferences: ["model"],
  },

  /** Female's horn heart-shaped */
  heracross: {
    genderDifferences: ["model"],
  },
  heracrossmega: {
    genderDifferences: ["model"],
  },

  /** Female's left ear shorter */
  sneasel: {
    genderDifferences: ["texture"],
  },
  sneaselhisui: {
    genderDifferences: ["texture"],
  },

  /** Female has longer shoulder fur */
  ursaring: {
    genderDifferences: ["texture"],
  },

  /** Female has lipstick-like mouth */
  wobbuffet: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller suction cups */
  octillery: {
    genderDifferences: ["texture"],
  },

  /** Female antennae shorter */
  ledyba: {
    genderDifferences: ["texture"],
  },
  ledian: {
    genderDifferences: ["texture"],
  },

  /** Female has one gill branch */
  wooper: {
    genderDifferences: ["texture"],
  },
  /** Female has smaller dorsal ridge */
  quagsire: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller tusk */
  piloswine: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller horns */
  houndoom: {
    genderDifferences: ["texture"],
  },

  /** Female has shorter tusks */
  donphan: {
    genderDifferences: ["texture"],
  },

  unown: {
    skins: {
      b: ["model", "texture"],
      c: ["model", "texture"],
      d: ["model", "texture"],
      e: ["model", "texture"],
      f: ["model", "texture"],
      g: ["model", "texture"],
      h: ["model", "texture"],
      i: ["model", "texture"],
      j: ["model", "texture"],
      k: ["model", "texture"],
      l: ["model", "texture"],
      m: ["model", "texture"],
      n: ["model", "texture"],
      o: ["model", "texture"],
      p: ["model", "texture"],
      q: ["model", "texture"],
      r: ["model", "texture"],
      s: ["model", "texture"],
      t: ["model", "texture"],
      u: ["model", "texture"],
      v: ["model", "texture"],
      w: ["model", "texture"],
      x: ["model", "texture"],
      y: ["model", "texture"],
      z: ["model", "texture"],
      exclamation: ["model", "texture"],
      question: ["model", "texture"],
    },
  },

  // ======================== GEN 3 ========================

  /** Female has smaller head feathers */
  combusken: {
    genderDifferences: ["model"],
  },

  /** Female's head crest is smaller */
  blaziken: {
    genderDifferences: ["model"],
  },

  /** Male has longer red markings on his upper wings */
  beautifly: {
    genderDifferences: ["model"],
  },

  /** Female has smaller antennae */
  dustox: {
    genderDifferences: ["model"],
  },

  /** Male has thicker stripes */
  ludicolo: {
    genderDifferences: ["model"],
  },

  /** Female has smaller leaves */
  nuzleaf: {
    genderDifferences: ["model"],
  },
  shiftry: {
    genderDifferences: ["model"],
  },

  /** Male's ears are higher */
  meditite: {
    genderDifferences: ["model"],
  },

  /** Male has a larger bulb on his head */
  medicham: {
    genderDifferences: ["model"],
  },

  /** Female's body leaf is longer */
  roselia: {
    genderDifferences: ["model"],
  },

  /** Female's feather is shorter */
  gulpin: {
    genderDifferences: ["model"],
  },

  /** Female has shorter whiskers */
  swalot: {
    genderDifferences: ["model"],
  },

  gardevoir: {
    skins: {
      christmas: [
        "model",
        "texture",
        "animation_ground_idle",
        "animation_water_idle",
        "animation_walking",
        "animation_swimming",
        "animation_attack",
        "animation_faint",
        "animation_sleeping",
      ],
    },
  },

  /** Female has larger hump */
  numel: {
    genderDifferences: ["model"],
  },
  camerupt: {
    genderDifferences: ["model"],
  },

  /** Female has a large diamond on her chest where male has two small ones */
  cacturne: {
    genderDifferences: ["model"],
  },

  /** Male's hair-like fins are shorter */
  milotic: {
    genderDifferences: ["model"],
  },

  /** Female has a shorter jaw guard */
  relicanth: {
    genderDifferences: ["model"],
  },

  // ======================== GEN 4 ========================

  /** Male has a notched dorsal fin */
  gible: {
    genderDifferences: ["texture"],
    skins: {
      halloween: ["model", "texture", "shiny_texture"],
    },
  },
  gabite: {
    genderDifferences: ["texture"],
    skins: {
      halloween: ["model", "texture", "shiny_texture"],
    },
  },
  garchomp: {
    genderDifferences: ["texture"],
    skins: {
      halloween: ["model", "texture", "shiny_texture"],
    },
  },
  garchompmega: {
    genderDifferences: ["texture"],
    skins: {
      halloween: ["model", "texture", "shiny_texture"],
    },
  },

  gallade: {
    skins: {
      christmas: ["model", "texture"],
    },
  },
  gallademega: {
    skins: {
      christmas: ["model", "texture"],
    },
  },

  /** Female has a larger collar */
  kricketot: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller mustache */
  kricketune: {
    genderDifferences: ["texture"],
  },

  /** Female's head stripe is shorter */
  pachirisu: {
    genderDifferences: ["texture"],
  },

  /** Male has shorter head fur */
  ambipom: {
    genderDifferences: ["texture"],
  },

  /** Female has higher bandages */
  croagunk: {
    genderDifferences: ["texture"],
  },

  /** Female's vocal sac is smaller */
  toxicroak: {
    genderDifferences: ["texture"],
  },

  /** Female has a larger bottom tail fin */
  finneon: {
    genderDifferences: ["texture"],
  },

  /** Female has longer fins */
  lumineon: {
    genderDifferences: ["texture"],
  },

  snorlax: {
    skins: {
      santa: ["texture"],
    },
  },

  spheal: {
    skins: {
      watermelon: ["texture"],
    },
  },

  /** Female's midsection is white */
  snover: {
    genderDifferences: ["texture"],
  },

  /** Female has longer chest fur */
  abomasnow: {
    genderDifferences: ["texture"],
  },

  /** Female color pattern inverted */
  hippopotas: {
    genderDifferences: ["texture"],
  },

  /** Male's body is light brown and female's is bluish-gray */
  hippowdon: {
    genderDifferences: ["texture"],
  },

  /** Female has longer cape */
  roserade: {
    genderDifferences: ["model", "texture"],
  },

  /** Female face marking red */
  combee: {
    genderDifferences: ["texture"],
  },

  /** Male has two additional curls on tail */
  bidoof: {
    genderDifferences: ["texture"],
  },

  /** Male's mask has two additional curls */
  bibarel: {
    genderDifferences: ["texture"],
  },

  /** Female's forehead marking is smaller */
  starly: {
    genderDifferences: ["texture"],
  },
  staravia: {
    genderDifferences: ["texture"],
  },
  staraptor: {
    genderDifferences: ["texture"],
  },

  /** Female has blue hind feet and a shorter mane*/
  shinx: {
    genderDifferences: ["texture"],
  },

  /** Female has exposed rear ankles and a shorter mane */
  luxio: {
    genderDifferences: ["texture"],
  },

  /** Female's mane is smaller */
  luxray: {
    genderDifferences: ["texture"],
  },

  /** Female has one less light-colored spot on her back*/
  buizel: {
    genderDifferences: ["texture"],
  },

  /** Female has one less light-colored bump on her back */
  floatzel: {
    genderDifferences: ["texture"],
  },

  /** Female shell color difference */
  shellos: {
    skins: {
      east: ["model", "texture"],
    },
    genderDifferences: ["texture"],
  },
  gastrodon: {
    skins: {
      east: ["model", "texture"],
    },
    genderDifferences: ["texture"],
  },

  /** Female's ear are shorter */
  weavile: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller upper horn */
  rhyperior: {
    genderDifferences: ["texture"],
  },

  /** Female's red finger markings are longer */
  tangrowth: {
    genderDifferences: ["texture"],
  },

  /** Female has smaller tusks */
  mamoswine: {
    genderDifferences: ["texture"],
  },

  burmy: {
    skins: {
      sandy: ["model", "texture"],
      trash: ["model", "texture"],
    },
  },

  darkrai: {
    skins: {
      halloween: ["model", "texture"],
    },
  },

  // ======================== GEN 5 ========================
  golett: {
    skins: {
      halloween: ["model", "texture"],
    },
  },
  golurk: {
    skins: {
      halloween: ["model", "texture"],
    },
    animatedTextureConfig: [3, 8],
  },

  /** Male has a reddish-pink wattle with long extensions while the female has a curved feather on the back of her head. Male has a green underside and female has a brown underside */
  unfezant: {
    genderDifferences: ["texture", "sound"],
  },

  /** Male is blue and female is pink, both have different patterns */
  frillish: {
    genderDifferences: ["texture"],
  },
  jellicent: {
    genderDifferences: ["texture"],
  },

  trubbish: {
    skins: {
      halloween: ["model", "texture"],
    },
  },
  garbodor: {
    skins: {
      halloween: ["model", "texture"],
    },
  },

  zorua: {
    skins: {
      halloween: ["model", "texture"],
    },
  },
  zoroark: {
    skins: {
      halloween: ["model", "texture"],
    },
  },

  deerling: {
    skins: {
      summer: ["model", "texture"],
      autumn: ["model", "texture"],
      winter: ["model", "texture"],
    },
  },
  sawsbuck: {
    skins: {
      summer: ["model", "texture"],
      autumn: ["model", "texture"],
      winter: ["model", "texture"],
    },
  },

  victini: {
    skins: {
      valentine: ["model", "texture"],
    },
  },

  // ======================== GEN 6 ========================

  flabebe: {
    skins: {
      blue: ["texture"],
      orange: ["texture"],
      white: ["texture"],
      yellow: ["texture"],
    },
  },
  floette: {
    skins: {
      blue: ["texture"],
      orange: ["texture"],
      white: ["texture"],
      yellow: ["texture"],
    },
  },
  florges: {
    skins: {
      blue: ["texture"],
      orange: ["texture"],
      white: ["texture"],
      yellow: ["texture"],
    },
  },

  furfrou: {
    skins: {
      dandy: ["model", "texture"],
      debutante: ["model", "texture"],
      diamond: ["model", "texture"],
      heart: ["model", "texture"],
      kabuki: ["model", "texture"],
      la_reine: ["model", "texture"],
      matron: ["model", "texture"],
      pharaoh: ["model", "texture"],
      star: ["model", "texture"],
    },
  },

  /** Male has mane, female tuft */
  pyroar: {
    genderDifferences: ["model", "texture"],
  },

  // ======================== GEN 7 ========================

  gastly: {
    skins: {
      halloween: ["texture"],
    },
  },
  haunter: {
    skins: {
      halloween: ["texture"],
    },
  },
  gengar: {
    skins: {
      halloween: ["texture"],
    },
  },

  mimikyu: {
    skins: {
      raichu: ["texture"],
      riolu: ["texture"],
      yamper: ["texture"],
    },
  },

  comfey: {
    skins: {
      christmas: ["model", "texture"],
    },
  },

  minior: {
    skins: {
      orange: ["model", "texture"],
      yellow: ["model", "texture"],
      green: ["model", "texture"],
      blue: ["model", "texture"],
      indigo: ["model", "texture"],
      violet: ["model", "texture"],
    },
  },

  marowakalola: {
    animatedTextureConfig: [2, 8],
  },

  // ======================== GEN 8 ========================

  alcremie: {
    skins: {
      ruby_cream: ["texture"],
      matcha_cream: ["texture"],
      mint_cream: ["texture"],
      lemon_cream: ["texture"],
      salted_cream: ["texture"],
      ruby_swirl: ["texture"],
      caramel_swirl: ["texture"],
      rainbow_swirl: ["texture"],
    },
  },

  // ======================== GEN 9 ========================

  armarouge: {
    skins: {
      christmas: ["model", "texture"],
    },
  },
  ceruledge: {
    skins: {
      halloween: ["model", "texture"],
    },
  },

  tinkaton: {
    skins: {
      christmas: ["model", "texture"],
    },
  },

  tatsugiri: {
    skins: {
      droopy: ["model", "texture"],
      stretchy: ["model", "texture"],
    },
  },

  clodsire: {
    skins: {
      stpatrick: [
        "model",
        "texture",
        "animation_walking",
        "animation_swimming",
        "animation_blink",
        "animation_attack",
        "animation_faint",
      ],
    },
  },

  palkia: {
    animationParticleEffects: ["pokeb:charge"],
  },

  arceus: {
    animationParticleEffects: ["pokeb:firing"],
  },
} as const;
