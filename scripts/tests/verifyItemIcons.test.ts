import fs from "fs";
import path from "path";
import type { IItemsJson, ItemTextureFile } from "../types";

/**
 * A file that contains all the items in the PokeBedrock behavior pack.
 */
const itemsJsonPath = path.join(process.cwd(), "items.json");

/**
 * Path to the item_texture.json file which stores all key-value pairs of item icons.
 */
const itemTexturesPath = path.join(
  process.cwd(),
  "textures",
  "item_texture.json"
);

test("Verify's that all item icons are present", async () => {
  if (!fs.existsSync(itemTexturesPath))
    throw new Error("item_texture.json not found");
  const itemTextures = JSON.parse(
    fs.readFileSync(itemTexturesPath, "utf-8")
  ) as ItemTextureFile;

  if (!fs.existsSync(itemsJsonPath)) throw new Error("items.json not found");
  const items = JSON.parse(
    fs.readFileSync(itemsJsonPath, "utf-8")
  ) as IItemsJson;

  // Creates a set with all the unique item icons.
  const itemIcons = new Set(Object.values(items));

  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  for (const icon of itemIcons) {
    if (itemTextures.texture_data[icon]) continue;

    console.error(`Icon '${icon}' not found in item_texture.json`);
  }

  // Assert that console.error was not called
  expect(consoleErrorSpy).not.toHaveBeenCalled();

  // Restore console.error after the test
  consoleErrorSpy.mockRestore();
});
