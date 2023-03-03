import { pokemonList } from "../../../development_behavior_packs/pixelmon/generator/pokemonList.js";

(async () => {
  for (const pokemon of pokemonList) {
    const pokemonName = pokemon.replace("pokemon:", "");
    console.log(
      `"${pokemonName}": {
        "textures": ["textures/items/pokemon/${pokemonName}"],
      },`
    );
  }
})();
