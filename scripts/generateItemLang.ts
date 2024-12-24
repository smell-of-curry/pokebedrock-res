import fs from "fs";
import path from "path";
import { editLangSection, Logger, typeIdToName } from "./utils";
import { IItemsJson } from "./types";

/**
 * A file that contains all the items in the PokeBedrock behavior pack.
 */
const itemsJsonPath = path.join(process.cwd(), "items.json");

if (!fs.existsSync(itemsJsonPath)) throw new Error("items.json not found");
const itemsJson = JSON.parse(
  fs.readFileSync(itemsJsonPath, "utf-8")
) as IItemsJson;

/**
 * Path to the lang file which stores all key-value pairs of item names.
 */
const langFilePath = path.join(process.cwd(), "texts", "en_US.lang");
if (!fs.existsSync(langFilePath)) throw new Error("en_US.lang not found");

const langFileContent = fs.readFileSync(langFilePath, "utf-8");
const lines = langFileContent.split(/\r?\n/);

const missingItems = Object.keys(itemsJson).filter(
  (i) => !lines.some((line) => line.startsWith(`item.${i}=`))
);
if (missingItems.length == 0) process.exit(0);

Logger.error(`Appending ${missingItems.length}x Missing items from en_US.lang`);

editLangSection(
  langFilePath,
  "Missing Items",
  missingItems
    .map(
      (item) =>
        // Map (ex. `masterball` => `master_ball`) so it can be converted to a displayable name
        `item.${item}=${typeIdToName(item.replace(/(\w*)(ball)/, "$1_ball"))}`
    )
    .join("\n")
);
