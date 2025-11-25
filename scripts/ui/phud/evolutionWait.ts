/**
 * Evolution Wait HUD Element
 *
 * Displays an evolution wait overlay with a styled box.
 * Shows text centered within the evolution box texture.
 */

import { defineMain, image, label } from "mcbe-ts-ui";
import { phudVisibility, phudRead } from "./_helpers";

// Evolution text label
const evolutionText = label("text")
  .anchor("center")
  .text("#text")
  .color([0.502, 0.502, 0.502])
  .layer(1002)
  .localize(true)
  .fontSize("normal")
  .fontType("MinecraftTen")
  .textAlignment("center")
  .bindings(phudRead("#evolutionWait", "#text"));

// Main evolution wait container
export default defineMain(
  "phud_evolutionWait",
  image("main")
    .texture("textures/ui/evolution_box")
    .layer(1000)
    .keepRatio(true)
    .anchor("bottom_middle")
    .size("70%", "100%")
    .offset(0, "32%")
    .controls(evolutionText)
    .bindings(...phudVisibility("#evolutionWait")),
  { subdir: "phud" }
);

