import {
  defineUI,
  image,
  phudVisibility,
  phudText,
  boundLabel,
} from "mcbe-ts-ui";

const playerPositionText = phudText(
  boundLabel("player_position_text")
    .anchor("bottom_middle")
    .layer(1)
    .enableProfanityFilter(false)
    .color("$chat_text_color")
    .shadow(),
  "#player_ping_text"
);

export default defineUI(
  "player_ping",
  image("main", "textures/ui/Black")
    .size("100%c + 6px", "100%c + 2px")
    .alpha(0.7)
    .controls(playerPositionText)
    .bindings(...phudVisibility("#player_ping_text"))
);
