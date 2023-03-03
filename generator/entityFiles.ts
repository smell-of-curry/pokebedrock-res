import fsExtra from "fs-extra";
import fs from "fs";
import { POKEMON } from "../../../development_behavior_packs/pixelmon/generator/dist/pokemon.js";

const TEMPLATE = JSON.parse(
  fs.readFileSync("generator/templates/entity.json").toString()
);

const directory = "entity/pokemon/";
fsExtra.emptyDirSync(directory);

(async () => {
  for (const [typeId, data] of Object.entries(POKEMON)) {
    console.warn(typeId);
    const pokemonName = data.name.toLowerCase();
    const pokemonType = data.types.includes("flying") ? "flying" : "ground";

    let json = JSON.stringify(TEMPLATE).replace(/{name}/g, pokemonName);
    json = json.replace(/{pokemonType}/g, pokemonType);

    fs.writeFileSync(`${directory}${pokemonName}.json`, json);
  }
})();
