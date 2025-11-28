import {
  boundLabel,
  defineMain,
  image,
  panel,
  phudText,
  phudVisibility,
} from "mcbe-ts-ui";

const FONT_SCALE = 1;

const actionbarLabel = phudText(
  boundLabel("label")
    .fontScaleFactor(FONT_SCALE)
    // TODO: Convert to `fromRGB` helper
    .color([1, 1, 0.52, 1])
    .layer(3),
  "#fake_actionbar"
);

const textBg = image("text_bg", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(actionbarLabel);

export default defineMain(
  "phud_actionbar",
  panel("main")
    .anchor("top_middle")
    .offset(0, "50% - 70px")
    .layer(41)
    .controls(textBg)
    .bindings(...phudVisibility("#fake_actionbar"))
);
