/**
 * Player Ping HUD Element
 *
 * Displays player ping/latency information in a styled tooltip format.
 * Shows text parsed from the #player_ping_text binding from the elements control.
 */

import { defineMain, image, label, phudVisibility, phudText } from "mcbe-ts-ui";

// Inner label that displays the ping text
const playerPositionText = phudText(
  label("player_position_text")
    .anchor("bottom_middle")
    .layer(1)
    .enableProfanityFilter(false)
    .color("$chat_text_color")
    .shadow(),
  "#player_ping_text"
);

// Main container - background image with padding around content
export default defineMain(
  "player_ping",
  image("main")
    .texture("textures/ui/Black")
    .size("100%c + 6px", "100%c + 2px")
    .alpha(0.7)
    .controls(playerPositionText)
    .bindings(...phudVisibility("#player_ping_text")),
  { subdir: "phud" }
);
