import {
  defineUI,
  image,
  phudVisibility,
  phudRead,
  fromRGB,
  boundLabel,
} from "mcbe-ts-ui";

const evolutionText = boundLabel("text")
  .color(fromRGB(128, 128, 128))
  .layer(1002)
  .localize()
  .fontType("MinecraftTen")
  .textAlignment("center")
  .bindings(phudRead("#evolutionWait", "#text"));

export default defineUI(
  "phud_evolutionWait",
  image("main", "textures/ui/evolution_box")
    .layer(1000)
    .anchor("bottom_middle")
    .size("70%", "100%")
    .offset(0, "32%")
    .controls(evolutionText)
    .bindings(...phudVisibility("#evolutionWait"))
);
