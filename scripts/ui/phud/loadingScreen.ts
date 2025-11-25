/**
 * Loading Screen HUD Element
 *
 * Displays a full-screen loading overlay with a dirt background.
 * Shows loading text centered on screen.
 */

import { defineMain, label, panel } from "mcbe-ts-ui";
import { phudVisibility, phudRead } from "./_helpers";

// Loading screen text label
const loadingText = label("text")
  .anchor("center")
  .text("#text")
  .layer(1002)
  .localize(true)
  .fontSize("normal")
  .textAlignment("center")
  .bindings(
    phudRead("#loadingScreen", "#loadingScreenText"),
    {
      binding_name: "#null",
      binding_type: "view",
      source_property_name: "(#loadingScreenText)",
      target_property_name: "#text",
    }
  );

// Main loading screen container - extends common.dirt_background
export default defineMain(
  "phud_loadingScreen",
  panel("main")
    .rawProp("type", "image")
    .rawProp("texture", "textures/ui/background")
    .rawProp("tiled", true)
    .rawProp("tiled_scale", [2, 2])
    .layer(1000)
    .fullSize()
    .controls(loadingText)
    .bindings(...phudVisibility("#loadingScreen")),
  { subdir: "phud" }
);

