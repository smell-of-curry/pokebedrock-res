/**
 * Loading Screen HUD Element
 *
 * Displays a full-screen loading overlay with a dirt background.
 * Shows loading text centered on screen.
 */

import {
  defineMain,
  label,
  panel,
  phudVisibility,
  phudRead,
  viewBinding,
} from "mcbe-ts-ui";

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
    viewBinding("(#loadingScreenText)", "#text")
  );

// Main loading screen container - tiled background
// Raw properties needed for tiled image which isn't supported by panel builder
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
