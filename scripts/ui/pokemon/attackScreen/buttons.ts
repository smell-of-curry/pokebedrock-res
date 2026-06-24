/**
 * Battle UI - Button Elements
 *
 * Action buttons, move buttons, and grid button elements.
 */

import {
  element,
  panel,
  image,
  label,
  extendRaw,
  collectionBinding,
  viewBinding,
  skip,
  first,
  strip,
  extend,
  type NamespaceBuilder,
  type NamespaceElement,
  type Offset,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  formButtonsDetailsBinding,
  defaultStateVars,
  hoverStateVars,
  pressedStateVars,
  lockedStateVars,
  type SharedElements,
} from "./shared";

// =============================================================================
// Simple Button Base
// =============================================================================

/**
 * Creates the simple button base element
 * Must be called after shared elements are registered
 */
function createSimpleButton(buttonHoverControlNs: NamespaceElement) {
  return element("simple_button")
    .extends("common_buttons.light_text_button")
    .variable("pressed_button_name", "button.form_button_click")
    .variableDefault("size", "default")
    .rawProp("size", "$size")
    .variable("border_visible", false)
    .variableDefault("hover_text_index", 53)
    .controls(
      extendRaw("default", "$button_state_panel", defaultStateVars),
      extendRaw(
        "hover",
        buttonHoverControlNs.getQualifiedName(),
        hoverStateVars
      ),
      extendRaw("pressed", "$button_state_panel", pressedStateVars),
      extendRaw("locked", "$button_state_panel", lockedStateVars)
    )
    .bindings(
      formButtonsDetailsBinding(),
      collectionBinding("#form_button_texture"),
      viewBinding("(not((%.1s * #form_button_texture) = 'f'))", "#enabled")
    );
}

// =============================================================================
// Action Buttons (Bag, Pokemon, Run)
// =============================================================================

/** Creates an action button panel */
function createActionButton(
  name: string,
  texture: string,
  offset: Offset,
  hoverIdx: number,
  simpleButtonNs: NamespaceElement
) {
  return panel(name)
    .size("default", "7%x")
    .offset(...offset)
    .anchor("top_left")
    .controls(
      extend("form_button", simpleButtonNs)
        .variable("default_button_texture", `textures/ui/battle/${texture}`)
        .variable("hover_button_texture", `textures/ui/battle/${texture}_hover`)
        .variable("pressed_button_texture", `textures/ui/battle/${texture}`)
        .variable(
          "locked_button_texture",
          `textures/ui/battle/${texture}_disabled`
        )
        .variable("hover_text_index", hoverIdx)
        .variable("size", ["25%", "80%"])
    );
}

// =============================================================================
// Move Selection Button
// =============================================================================

const moveSelectionFrontImage = image("front_image", "#texture")
  .size("85%", "85%")
  .layer(16)
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding("#form_button_texture"),
    viewBinding(
      `('textures/ui/battle/moveSelectionBadges/' + ${skip(
        3,
        "#form_button_texture"
      )})`,
      "#texture"
    )
  );

function createMoveSelectionButton(simpleButtonNs: NamespaceElement) {
  return panel("move_selection_button")
    .size("10%", "60%")
    .layer(15)
    .controls(
      extend("button", simpleButtonNs)
        .variable(
          "default_button_texture",
          "textures/ui/battle/moveSelectionBadges/background"
        )
        .variable(
          "hover_button_texture",
          "textures/ui/battle/moveSelection_blank_badge"
        )
        .variable(
          "pressed_button_texture",
          "textures/ui/battle/moveSelection_blank_badge"
        )
        .variable(
          "locked_button_texture",
          "textures/ui/battle/moveSelectionBadges/background"
        )
        .variable("border_visible", false)
        .variable("hover_text_index", 27),
      moveSelectionFrontImage
    )
    .bindings(...visibilityForId("battleButton:move_selection"));
}

// =============================================================================
// Move Button
// =============================================================================

const moveNameLabel = label("name", "#text")
  .offset("40%", "20%")
  .layer(10)
  .localize()
  .color("black")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      `(${strip(
        `(('showdown.moves' + ${first(30, skip(36, "#form_button_text"))}))`
      )} + '.name')`,
      "#text"
    )
  );

const moveIcon = image("icon", "#texture")
  .layer(10)
  .size(20, 20)
  .rawProp("offset", "$icon_offset")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      strip(
        `('textures/ui/gui/attacks/' + ${first(
          8,
          skip(4, "#form_button_text")
        )})`
      ),
      "#texture"
    )
  );

const ppTextLabel = label("pp_text", "#text")
  .offset("45%", "92%")
  .layer(11)
  .fontScale(0.8)
  .color("white")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(strip(first(7, skip(66, "#form_button_text"))), "#text")
  );

function createMoveButtonContainer(simpleButtonNs: NamespaceElement) {
  return panel("button")
    .size("40%", "150%")
    .controls(
      extend("form_button", simpleButtonNs)
        .variable("default_button_texture", "textures/ui/battle/moveSelection")
        .variable(
          "hover_button_texture",
          "textures/ui/battle/moveSelection_hover"
        )
        .variable("pressed_button_texture", "textures/ui/battle/moveSelection")
        .variable(
          "locked_button_texture",
          "textures/ui/battle/moveSelection_locked"
        )
        .variable("hover_text_index", 98)
    );
}

function createMoveButton(simpleButtonNs: NamespaceElement) {
  return panel("move_button")
    .size("default", "7%x")
    .rawProp("offset", "$offset")
    .anchor("top_left")
    .controls(
      createMoveButtonContainer(simpleButtonNs),
      moveNameLabel,
      moveIcon,
      ppTextLabel
    );
}

// =============================================================================
// Button Elements Interface and Registration
// =============================================================================

export interface ButtonElements {
  simpleButton: NamespaceElement;
  bagButton: NamespaceElement;
  partyPokemonButton: NamespaceElement;
  runButton: NamespaceElement;
  battleActionButton: NamespaceElement;
  moveSelectionButton: NamespaceElement;
  moveButton: NamespaceElement;
  gridButtonCheckId: NamespaceElement;
  gridButton: NamespaceElement;
}

/**
 * Register all button elements to namespace and return references
 */
export function registerButtonElements(
  ns: NamespaceBuilder,
  shared: SharedElements
): ButtonElements {
  // Register simple button base
  const simpleButtonNs = createSimpleButton(
    shared.buttonHoverControl
  ).addToNamespace(ns);

  // Register action buttons
  const bagButtonNs = createActionButton(
    "bag_button",
    "menu_bag",
    ["-45.5%", "-13%"],
    16,
    simpleButtonNs
  ).addToNamespace(ns);

  const partyPokemonButtonNs = createActionButton(
    "party_pokemon_button",
    "menu_poke",
    ["-45.5%", "-26%"],
    20,
    simpleButtonNs
  ).addToNamespace(ns);

  const runButtonNs = createActionButton(
    "run_button",
    "menu_run",
    ["-45.5%", "-38%"],
    16,
    simpleButtonNs
  ).addToNamespace(ns);

  // Battle action button (combines bag, pokemon, run)
  const battleActionButtonNs = panel("battle_action_button")
    .size("default", "100%c")
    .variable("bag_button_id", "battleButton:bag")
    .variable("pokemon_button_id", "battleButton:pokemon")
    .variable("run_button_id", "battleButton:run")
    .controls(
      extend("bag_button", bagButtonNs).bindings(
        ...visibilityForId("$bag_button_id")
      ),
      extend("poke_button", partyPokemonButtonNs).bindings(
        ...visibilityForId("$pokemon_button_id")
      ),
      extend("run_button", runButtonNs).bindings(
        ...visibilityForId("$run_button_id")
      )
    )
    .addToNamespace(ns);

  // Move selection button
  const moveSelectionButtonNs =
    createMoveSelectionButton(simpleButtonNs).addToNamespace(ns);

  // Move button
  const moveButtonNs = createMoveButton(simpleButtonNs).addToNamespace(ns);

  // Grid button check ID template
  const gridButtonCheckIdNs = element("grid_button_check_id")
    .extendsFrom(moveButtonNs)
    .variableDefault("button_id", "b:1_")
    .bindings(...visibilityForId("$button_id"))
    .addToNamespace(ns);

  // Grid button with all positions
  const gridButtonOffsets = [
    ["-19%", "25%"],
    ["-19%", "80%"],
    ["21.5%", "-175%"],
    ["21.5%", "-120%"],
  ];

  const gridButtonControls = gridButtonOffsets.map((offset, index) =>
    extend(`grid_button_${index + 1}`, gridButtonCheckIdNs)
      .variable("icon_offset", [
        `${index <= 1 ? "-" : ""}15%`, // First two buttons on left side (-)
        "-14%",
      ])
      .variable("offset", offset)
      .variable("button_id", `b:${index + 1}_`)
  );

  const gridButtonNs = panel("grid_button")
    .size("default", "100%c")
    .controls(...gridButtonControls)
    .addToNamespace(ns);

  return {
    simpleButton: simpleButtonNs,
    bagButton: bagButtonNs,
    partyPokemonButton: partyPokemonButtonNs,
    runButton: runButtonNs,
    battleActionButton: battleActionButtonNs,
    moveSelectionButton: moveSelectionButtonNs,
    moveButton: moveButtonNs,
    gridButtonCheckId: gridButtonCheckIdNs,
    gridButton: gridButtonNs,
  };
}
