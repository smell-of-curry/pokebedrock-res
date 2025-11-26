import {
  defineMain,
  image,
  boundLabel,
  panel,
  stackPanel,
  phudVisibility,
  phudRead,
  firstStripped,
  skipStripped,
} from "mcbe-ts-ui";

/**
 * The variable size of currency display.
 * First 80 Chars shows the current quest, the rest shows the amount of currency.
 *
 * @see pokebedrock-beh/src/pokebedrock-server/modules/events/topUiManager.ts#L41
 */
const VARIABLE_SIZE = 80;

const questLabel = boundLabel("quest_label")
  .layer(3)
  .fontScaleFactor("$font_scale")
  .color("$color")
  .bindings(
    phudRead("#level_number", "#text", firstStripped(VARIABLE_SIZE, "${prop}"))
  );

const quest = image("quest", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(questLabel);

const currencyLabel = boundLabel("currency_label")
  .layer(3)
  .fontScaleFactor("$font_scale")
  .color("$color")
  .bindings(
    phudRead("#level_number", "#text", skipStripped(VARIABLE_SIZE, "${prop}"))
  );

const currency = image("currency", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(currencyLabel);

const stackPanelElement = stackPanel("stack_panel", "horizontal")
  .wrapChildren()
  .controls(quest, panel("separator").size(3, 0), currency);

// Main panel - sizes to largest child
export default defineMain(
  "phud_currency",
  panel("main")
    .size("100%cm", "100%cm")
    .controls(stackPanelElement)
    .bindings(...phudVisibility("#level_number"))
);
