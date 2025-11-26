/**
 * Currency HUD Element
 *
 * Displays quest and currency information parsed from #level_number binding.
 * The format is: [first 80 chars = quest]_[rest = currency]
 */

import {
  defineMain,
  image,
  label,
  panel,
  stackPanel,
  phudVisibility,
  phudRead,
  firstStripped,
  skipStripped,
} from "mcbe-ts-ui";

// Quest label - displays first 80 characters (quest info)
const questLabel = label("quest_label")
  .anchor("center")
  .fontScaleFactor("$font_scale")
  .color("$color")
  .text("#text")
  .layer(3)
  .localize(false)
  .alpha(1)
  .bindings(phudRead("#level_number", "#text", firstStripped(80, "${prop}")));

// Quest background
const quest = image("quest")
  .texture("textures/ui/hud_tip_text_background")
  .size("100%c + 12px", "100%c + 5px")
  .alpha(0.6)
  .controls(questLabel);

// Separator panel between quest and currency
const separator = panel("separator").size(3, 0);

// Currency label - displays everything after first 80 characters
const currencyLabel = label("currency_label")
  .anchor("center")
  .fontScaleFactor("$font_scale")
  .color("$color")
  .text("#text")
  .layer(3)
  .localize(false)
  .alpha(1)
  .bindings(phudRead("#level_number", "#text", skipStripped(80, "${prop}")));

// Currency background
const currency = image("currency")
  .texture("textures/ui/hud_tip_text_background")
  .size("100%c + 12px", "100%c + 5px")
  .alpha(0.6)
  .controls(currencyLabel);

// Horizontal stack panel containing quest and currency
const stackPanelElement = stackPanel("stack_panel")
  .horizontal()
  .size("100%c", "100%c")
  .anchor("center")
  .controls(quest, separator, currency);

// Main panel - sizes to largest child
export default defineMain(
  "phud_currency",
  panel("main")
    .size("100%cm", "100%cm")
    .controls(stackPanelElement)
    .bindings(...phudVisibility("#level_number")),
  { subdir: "phud" }
);
