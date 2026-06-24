import {
  defineUI,
  fromRGB,
  hudSubtitleBinding,
  image,
  boundLabel,
  phudRead,
  phudVisibility,
  stackPanel,
  viewBinding,
} from "mcbe-ts-ui";

const battleLogText = boundLabel("text")
  .anchor("top_middle")
  .layer(1002)
  .localize()
  .textAlignment("center")
  .bindings(
    phudRead("#battleLog", "#log_text"),
    viewBinding("#log_text", "#text")
  );

const menuExtra = image("menu_extra", "textures/ui/battle/white_transparency")
  .color(fromRGB(35, 32, 32))
  .layer(2)
  .fill()
  .anchor("bottom_left")
  .size("85%")
  .controls(battleLogText);

const infoLabel = boundLabel("info_label")
  .color("default")
  .alpha(1)
  .textAlignment("center")
  .size("fill")
  .layer(3)
  .bindings(hudSubtitleBinding());

const mainHolder = stackPanel("main_holder", "horizontal")
  .size("default", "95%")
  .anchor("bottom_left")
  .controls(menuExtra, infoLabel);

export default defineUI(
  "phud_battleWait",
  image("main", "textures/ui/battle/white_transparency")
    .color(fromRGB(191, 43, 54))
    .layer(1000)
    .fill()
    .anchor("bottom_left")
    .size("default", "30%")
    .controls(mainHolder)
    .bindings(...phudVisibility("#battleLog"))
);
