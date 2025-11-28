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
  type ElementBuilder,
  type Offset,
  extend,
} from "mcbe-ts-ui";

import {
  NS,
  visibilityForId,
  formButtonsDetailsBinding,
  defaultStateVars,
  hoverStateVars,
  pressedStateVars,
  lockedStateVars,
} from "./shared";

/**
 * Simple button base - extends common_buttons.light_text_button
 */
export const simpleButton = element("simple_button")
  .extends("common_buttons.light_text_button")
  .variable("pressed_button_name", "button.form_button_click")
  .variableDefault("size", "default")
  .rawProp("size", "$size")
  .variable("border_visible", false)
  .variableDefault("hover_text_index", 53)
  .controls(
    extendRaw("default", "$button_state_panel", defaultStateVars),
    extendRaw("hover", `${NS}.button_hover_control`, hoverStateVars),
    extendRaw("pressed", "$button_state_panel", pressedStateVars),
    extendRaw("locked", "$button_state_panel", lockedStateVars)
  )
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding("#form_button_texture"),
    viewBinding("(not((%.1s * #form_button_texture) = 'f'))", "#enabled")
  );

// =============================================================================
// Action Buttons
// =============================================================================

/** Creates an action button (bag, pokemon, run) */
const createActionButton = (
  name: string,
  texture: string,
  offset: Offset,
  hoverIdx: number
) =>
  panel(name)
    .size("default", "7%x")
    .offset(...offset)
    .anchor("top_left")
    .controls(
      extend("form_button", simpleButton)
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

export const bagButton = createActionButton(
  "bag_button",
  "menu_bag",
  ["-45.5%", "-13%"],
  16
);

export const partyPokemonButton = createActionButton(
  "party_pokemon_button",
  "menu_poke",
  ["-45.5%", "-26%"],
  20
);

export const runButton = createActionButton(
  "run_button",
  "menu_run",
  ["-45.5%", "-38%"],
  16
);

export const battleActionButton = panel("battle_action_button")
  .size("default", "100%c")
  .variable("bag_button_id", "battleButton:bag")
  .variable("pokemon_button_id", "battleButton:pokemon")
  .variable("run_button_id", "battleButton:run")
  .controls(
    extend("bag_button", bagButton).bindings(
      ...visibilityForId("$bag_button_id")
    ),
    extend("poke_button", partyPokemonButton).bindings(
      ...visibilityForId("$pokemon_button_id")
    ),
    extend("run_button", runButton).bindings(
      ...visibilityForId("$run_button_id")
    )
  );

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

export const moveSelectionButton = panel("move_selection_button")
  .size("10%", "60%")
  .layer(15)
  .controls(
    extend("button", simpleButton)
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

const moveButtonContainer = panel("button")
  .size("40%", "150%")
  .controls(
    extend("form_button", simpleButton)
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

export const moveButton = panel("move_button")
  .size("default", "7%x")
  .rawProp("offset", "$offset")
  .anchor("top_left")
  .controls(moveButtonContainer, moveNameLabel, moveIcon, ppTextLabel);

/** Grid button check ID template - move button with visibility binding */
export const gridButtonCheckId = element("grid_button_check_id")
  .extends(`${NS}.move_button`)
  .variableDefault("button_id", "b:1_")
  .bindings(...visibilityForId("$button_id"));

const gridButtonOffsets = [
  ["-19%", "25%"],
  ["-19%", "80%"],
  ["21.5%", "-175%"],
  ["21.5%", "-120%"],
];
export const gridButton = panel("grid_button").size("default", "100%c");
const gridButtonControls: ElementBuilder[] = [];
for (const offset of gridButtonOffsets) {
  gridButtonControls.push(
    extend(`grid_button_${gridButtonControls.length + 1}`, gridButtonCheckId)
      .variable("icon_offset", [
        // Make first two buttons on left side (-)
        `${gridButtonControls.length <= 1 ? "-" : ""}15%`,
        "-14%",
      ])
      .variable("offset", offset)
      .variable("button_id", `b:${gridButtonControls.length + 1}_`)
  );
}
gridButton.controls(...gridButtonControls);

/**
 * Helper to add all button elements to namespace
 */
export function addButtonElements(
  add: (builder: ElementBuilder) => void
): void {
  add(simpleButton);
  add(bagButton);
  add(partyPokemonButton);
  add(runButton);
  add(battleActionButton);
  add(moveSelectionButton);
  add(moveButton);
  add(gridButtonCheckId);
  add(gridButton);
}
