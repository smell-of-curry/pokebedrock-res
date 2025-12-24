import {
  defineUI,
  phudVisibility,
  phudRead,
  viewBinding,
  image,
  boundLabel,
} from "mcbe-ts-ui";

const loadingText = boundLabel("text")
  .layer(1002)
  .localize()
  .textAlignment("center")
  .bindings(
    phudRead("#loadingScreen", "#loadingScreenText"),
    viewBinding("(#loadingScreenText)", "#text")
  );

export default defineUI(
  "phud_loadingScreen",
  image("main", "textures/ui/background")
    .tiled()
    .tiledScale(2, 2)
    .layer(1000)
    .fullSize()
    .controls(loadingText)
    .bindings(...phudVisibility("#loadingScreen"))
);
