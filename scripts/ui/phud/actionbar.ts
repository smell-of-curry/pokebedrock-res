/**
 * Actionbar HUD Element
 *
 * Custom actionbar display that shows text from #fake_actionbar binding.
 * Uses a styled background similar to vanilla tip text.
 */

import {
  defineMain,
  image,
  label,
  panel,
  phudVisibility,
  phudText,
} from "mcbe-ts-ui";

// Label that displays the actionbar text
const actionbarLabel = phudText(
  label("label")
    .anchor("center")
    .fontScaleFactor("$font_scale")
    .color("$color")
    .layer(3)
    .localize(false)
    .alpha(1),
  "#fake_actionbar"
);

// Background image that sizes to content
const textBg = image("text_bg")
  .texture("textures/ui/hud_tip_text_background")
  .size("100%c + 12px", "100%c + 5px")
  .alpha(0.6)
  .controls(actionbarLabel);

// Main panel container
export default defineMain(
  "phud_actionbar",
  panel("main")
    .fullSize()
    .layer(41)
    .controls(textBg)
    .bindings(...phudVisibility("#fake_actionbar")),
  { subdir: "phud" }
);
