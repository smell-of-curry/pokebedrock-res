import {
  boundLabel,
  defineMain,
  image,
  panel,
  phudText,
  phudVisibility,
} from "mcbe-ts-ui";

// Label that displays the actionbar text
const actionbarLabel = phudText(
  boundLabel("label").fontScaleFactor("$font_scale").color("$color").layer(3),
  "#fake_actionbar"
);

// Background image that sizes to content
const textBg = image("text_bg", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(actionbarLabel);

// Main panel container
export default defineMain(
  "phud_actionbar",
  panel("main")
    .layer(41)
    .controls(textBg)
    .bindings(...phudVisibility("#fake_actionbar"))
);
