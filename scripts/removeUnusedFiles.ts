import fsExtra from "fs-extra";
import { join } from "path";
import { confirm } from "@inquirer/prompts";
import { IItemsJson, ItemTextureFile, PokemonJsonContent } from "./types";
import { Logger } from "./utils";

const root = join(__dirname, "../");
const folders = ["animations", "models", "textures"];
const pokemonJsonPath = join(root, "pokemon.json");
const pokemonJson: PokemonJsonContent = fsExtra.readJSONSync(pokemonJsonPath);
const itemsJsonPath = join(root, "items.json");
const itemTexturesPath = join(root, "textures", "item_texture.json");

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
        message: `'${pokemonTypeId}' is not currently marked as having a model, but has a file at path ${join(
          path,
          file
        ).replace(root, "")}. Do you want to delete it?`,
      });

      if (!shouldDelete) continue;
      fsExtra.removeSync(join(path, file));
      Logger.info(`Deleted ${folder}/${file}`);
    }
  }

  if (!fsExtra.existsSync(itemTexturesPath))
    throw new Error("item_texture.json not found");
  const itemTextures = JSON.parse(
    fsExtra.readFileSync(itemTexturesPath, "utf-8")
  ) as ItemTextureFile;
  const itemTexturesIcons = Object.keys(itemTextures.texture_data);

  if (!fsExtra.existsSync(itemsJsonPath))
    throw new Error("items.json not found");
  const items = JSON.parse(
    fsExtra.readFileSync(itemsJsonPath, "utf-8")
  ) as IItemsJson;
  const itemIcons = new Set(Object.values(items));

  // Loop through ItemTextures, and find unused textures.
  for (const itemIcon of itemTexturesIcons) {
    if (itemIcons.has(itemIcon)) continue;
    // Ignore Spawn Eggs
    if (itemIcon.endsWith("_spawn_egg")) continue;
    // Ignore Pokemon Egg textures
    const iconData = itemTextures.texture_data[itemIcon];
    if (!iconData) continue;
    if (iconData.textures.includes("textures/sprites/")) continue;
    console.log(`Found Un-Used Item Icon '${itemIcon}'`);
    for (let iconPath of Array.isArray(iconData.textures)
      ? iconData.textures
      : [iconData.textures]) {
      fsExtra.removeSync(join(root, iconPath));
    }
    delete itemTextures.texture_data[itemIcon];
  }

  fsExtra.writeJSONSync(itemTexturesPath, itemTextures, { spaces: 2 });
})();
