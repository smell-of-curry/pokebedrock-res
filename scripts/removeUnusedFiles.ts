import fsExtra from "fs-extra";
import { join } from "path";
import { confirm } from "@inquirer/prompts";
import { PokemonJsonContent } from "./types";
import { Logger } from "./utils";

const root = join(__dirname, "../");
const folders = ["animations", "models", "textures"];
const pokemonJsonPath = join(root, "pokemon.json");
const pokemonJson: PokemonJsonContent = fsExtra.readJSONSync(pokemonJsonPath);

/**
 * Gets the path to the pokemon directory of a folder in {@link folders}.
 * @param folder
 * @returns
 */
const getPath = (folder: string) => {
  switch (folder) {
    case "animations":
      return join(root, folder, "pokemon");
    case "models":
      return join(root, folder, "entity", "pokemon");
    case "sounds":
      return join(root, folder, "mob", "pokemon");
    case "textures":
      return join(root, folder, "entity", "pokemon");
    default:
      return join(root, folder);
  }
};

/**
 * Gets a Pokemon type ID based on the folder and file name.
 * @param folder
 * @param file
 * @returns
 */
const getPokemonTypeId = (folder: string, file: string) => {
  switch (folder) {
    case "animations":
      return file.replace(".animation.json", "");
    case "models":
      return file.replace(".geo.json", "");
    case "sounds":
      return file.replace(".ogg", "");
    default:
      return file;
  }
};

(async () => {
  for (const folder of folders) {
    const path = getPath(folder);
    if (!fsExtra.existsSync(path)) {
      console.error(`Folder ${path} does not exist!`);
      return process.exit(1);
    }

    const files = fsExtra.readdirSync(path);
    for (const file of files) {
      const pokemonTypeId = getPokemonTypeId(folder, file);
      if (pokemonJson.pokemonWithModels.includes(pokemonTypeId)) continue;

      const shouldDelete = await confirm({
        message: `'${pokemonTypeId}' is not currently marked as having a model, but has a file at path ${
          folder + "/" + file
        }. Do you want to delete it?`,
      });

      if (!shouldDelete) continue;
      fsExtra.removeSync(join(path, file));
      Logger.info(`Deleted ${folder}/${file}`);
    }
  }
})();
