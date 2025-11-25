/**
 * Battle Wait HUD Element
 *
 * Displays a battle log overlay at the bottom of the screen with a red-tinted
 * transparent background. Shows battle text and subtitle information.
 */

import { defineMain, image, label, stackPanel, panel } from "mcbe-ts-ui";
import { phudVisibility, phudRead } from "./_helpers";

// Battle log text label
const battleLogText = label("text")
  .anchor("top_middle")
  .text("#text")
  .layer(1002)
  .localize(true)
  .fontSize("normal")
  .textAlignment("center")
  .bindings(
    phudRead("#battleLog", "#log_text"),
    {
      binding_name: "#null",
      binding_type: "view",
      source_property_name: "#log_text",
      target_property_name: "#text",
    }
  );

// Menu extra panel - dark background for battle text
const menuExtra = image("menu_extra")
  .texture("textures/ui/battle/white_transparency")
  .color([0.137, 0.125, 0.125])
  .layer(2)
  .keepRatio(true)
  .fill(true)
  .anchor("bottom_left")
  .size("85%", "100%")
  .controls(battleLogText);

// Info label - displays subtitle text
const infoLabel = label("info_label")
  .localize(false)
  .text("#text")
  .color("default")
  .alpha(1)
  .textAlignment("center")
  .fontScaleFactor(1)
  .anchor("center")
  .size("fill", "100%")
  .layer(3)
  .shadow(false)
  .bindings({
    binding_name: "#hud_subtitle_text_string",
    binding_name_override: "#text",
    binding_type: "global",
  });

// Main holder stack panel
const mainHolder = stackPanel("main_holder")
  .horizontal()
  .size("100%", "95%")
  .anchor("bottom_left")
  .controls(menuExtra, infoLabel);

// Main battle wait container
export default defineMain(
  "phud_battleWait",
  image("main")
    .texture("textures/ui/battle/white_transparency")
    .color([0.749, 0.168, 0.211])
    .layer(1000)
    .keepRatio(true)
    .fill(true)
    .anchor("bottom_left")
    .size("100%", "30%")
    .controls(mainHolder)
    .bindings(...phudVisibility("#battleLog")),
  { subdir: "phud" }
);

