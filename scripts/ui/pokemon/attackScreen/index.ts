/**
 * Battle UI
 *
 * Pokemon battle interface with action buttons, move selection, and actor details.
 * Main entry point that combines all battle screen modules.
 */

import { defineUI, panel, image, label, stackPanel, element } from "mcbe-ts-ui";

import { NS, registerSharedElements } from "./shared";
import { registerButtonElements } from "./buttons";
import { registerProgressElements, registerPpBarVariants } from "./progress";
import { registerActorElements } from "./actors";

export default defineUI(
  NS,
  (ns) => {
    // Register all module elements in dependency order
    const shared = registerSharedElements(ns);
    const progress = registerProgressElements(ns);
    registerPpBarVariants(ns, progress.ppBar);
    const buttons = registerButtonElements(ns, shared);
    const actors = registerActorElements(ns, progress);

    // Left button panel extending button_stack
    const leftButtonPanel = element("left_button_panel")
      .extendsFrom(shared.buttonStack)
      .layer(3)
      .variable("button", buttons.battleActionButton.getQualifiedName());

    // Move selection panel extending button_stack
    const moveSelectionPanel = element("move_selection_button")
      .extendsFrom(shared.buttonStack)
      .layer(3)
      .offset("55%", "20%")
      .variable("button", buttons.moveSelectionButton.getQualifiedName());

    // Grid panel extending button_stack
    const gridPanel = element("grid_panel")
      .extendsFrom(shared.buttonStack)
      .layer(4)
      .variable("button", buttons.gridButton.getQualifiedName());

    // Button grid middle container
    const buttonGridMiddle = image(
      "button_grid_middle",
      "textures/ui/battle/white_transparency"
    )
      .color("black")
      .alpha(0)
      .layer(1)
      .rawProp("keep_ratio", true)
      .fill()
      .size("80%", "95%")
      .offset("9%", 0)
      .controls(gridPanel);

    // Menu extra container
    const menuExtra = image(
      "menu_extra",
      "textures/ui/battle/white_transparency"
    )
      .color([0.137, 0.125, 0.125])
      .layer(2)
      .rawProp("keep_ratio", true)
      .fill()
      .anchor("bottom_left")
      .size("85%")
      .controls(leftButtonPanel, moveSelectionPanel, buttonGridMiddle);

    // Info label for battle text
    const infoLabel = label("info_label", "#form_text")
      .color("default")
      .textAlignment("center")
      .fontScale(1)
      .size("fill")
      .layer(3);

    // Main buttons holder
    const mainButtonsHolder = stackPanel("main_buttons_holder", "horizontal")
      .size("default", "95%")
      .anchor("bottom_left")
      .controls(menuExtra, infoLabel);

    // Battle menu at bottom of screen
    const battleMenu = image(
      "battle_menu",
      "textures/ui/battle/white_transparency"
    )
      .color([0.749, 0.168, 0.211])
      .layer(1)
      .fill()
      .anchor("bottom_left")
      .size("default", "29%")
      .controls(mainButtonsHolder);

    // Opponent actors panel extending button_stack
    const opponentActors = element("opponent_actors")
      .extendsFrom(shared.buttonStack)
      .size("25%")
      .layer(21)
      .variable("button", actors.opponentActorDetailsButton.getQualifiedName());

    // Spacing panel for actors
    const actorsSpacing = panel("spacing").size("50%");

    // Ally actors panel extending button_stack
    const allyActors = element("ally_actors")
      .extendsFrom(shared.buttonStack)
      .size("25%")
      .layer(21)
      .variable("button", actors.allyActorDetailsButton.getQualifiedName());

    // Actor details selection at top of screen
    const actorsDetailsSelection = stackPanel(
      "actors_details_selection",
      "horizontal"
    )
      .size("default", "71%")
      .offset("0%", "25%")
      .anchor("top_middle")
      .controls(opponentActors, actorsSpacing, allyActors);

    // Main battle UI panel
    const [, finalNs] = ns.add(
      panel("main").controls(battleMenu, actorsDetailsSelection)
    );
    return finalNs;
  },
  {
    filename: "attackScreen",
    subdir: "pokemon",
  }
);
