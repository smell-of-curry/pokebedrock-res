/**
 * Battle UI - Actor Elements
 *
 * Ally and opponent actor buttons, descriptions, and related elements.
 */

import {
  element,
  panel,
  image,
  label,
  stackPanel,
  collectionBinding,
  viewBinding,
  skip,
  first,
  strip,
  type ElementBuilder,
  SizeValue,
  extend,
} from "mcbe-ts-ui";

import { NS, visibilityForId, formButtonsDetailsBinding } from "./shared";
import { dynamicProgressBar } from "./progress";

// =============================================================================
// Actor Entity Icon
// =============================================================================

/** Entity icon inside the overlay */
const entityIcon = image("entity_icon", "#texture")
  .size(40, 40)
  .layer(25)
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding(
      "#form_button_texture_file_system",
      "form_buttons",
      "#texture_file_system"
    ),
    collectionBinding("#form_button_texture", "form_buttons", "#texture")
  );

/** Battle actor entity icon overlay */
export const battleActorEntityIconOverlay = image(
  "battle_actor_entity_icon_overlay",
  "$actor_icon_overlay_texture"
)
  .size(40, 40)
  .variableDefault(
    "actor_icon_overlay_texture",
    "textures/ui/battle/pokemon_warning"
  )
  .variableDefault("actor_icon_offset", [0, 0])
  .rawProp("offset", "$actor_icon_offset")
  .controls(entityIcon);

// =============================================================================
// Actor Description
// =============================================================================

/** Spacer panel for layout */
const spacerPanel = (height: SizeValue) =>
  panel("spacer").size("default", height);

/** Details text label */
const detailsTextLabel = label("details_text", "#text")
  .color([0.768, 0.768, 0.768])
  .fontScale(1)
  .rawProp("offset", "$text_offset")
  .size("default", "65%")
  .rawProp("text_alignment", "$text_alignment")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(strip(first(58, "#form_button_text")), "#text")
  );

/** Health text label */
const healthTextLabel = label("health_text", "#text")
  .color("white")
  .fontScale(0.8)
  .offset("0%", "0%")
  .fontType("smooth")
  .textAlignment("center")
  .layer(32)
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(skip(62, "#form_button_text"), "#text")
  );

/** HP bar panel */
const hpBarPanel = panel("hp_bar")
  .size("default", "21%")
  .layer(30)
  .controls(healthTextLabel, dynamicProgressBar);

/** Battle actor description - shows name and HP bar */
export const battleActorDescription = stackPanel(
  "battle_actor_description",
  "vertical"
)
  .size("default", 40)
  .variableDefault("text_alignment", "left")
  .variableDefault("text_offset", [0, 0])
  .controls(spacerPanel("3%"), detailsTextLabel, spacerPanel("3%"), hpBarPanel);

// =============================================================================
// Actor Buttons
// =============================================================================

/** Battle actor button base - extends common.button */
export const battleActorButton = element("battle_actor_button")
  .extends("common.button")
  .variable("pressed_button_name", "button.form_button_click")
  .variable("default_button_texture", "textures/ui/battle/opponent")
  .variable("hover_button_texture", "textures/ui/battle/opponent")
  .variable("pressed_button_texture", "textures/ui/battle/opponent")
  .variable("locked_button_texture", "textures/ui/battle/opponent")
  .enabled(false)
  .size(90, 42);

/** Spacing panel for horizontal layout */
const spacingPanel = panel("spacing").size("5%");

/** Ally actor details overlay */
const allyDetailsOverlay = stackPanel("details_overlay", "horizontal").controls(
  battleActorDescription,
  spacingPanel,
  extend("entity_icon_overlay", battleActorEntityIconOverlay).variable(
    "actor_icon_overlay_texture",
    "textures/ui/battle/pokemon_healthy"
  )
);

/** Ally actor button */
export const allyActorButton = element("ally_actor_button")
  .extends(`${NS}.battle_actor_button`)
  .controls(allyDetailsOverlay);

/** Opponent actor details overlay */
const opponentDetailsOverlay = stackPanel(
  "details_overlay",
  "horizontal"
).controls(battleActorEntityIconOverlay, battleActorDescription);

/** Opponent actor button */
export const opponentActorButton = element("opponent_actor_button")
  .extends(`${NS}.battle_actor_button`)
  .controls(opponentDetailsOverlay);

// =============================================================================
// Actor Button Check ID Templates
// =============================================================================

/** Ally actor button with visibility check */
export const allyActorDetailsButtonCheckId = element(
  "ally_actor_details_button_check_id"
)
  .extends(`${NS}.ally_actor_button`)
  .variableDefault("button_id", "b:opponent_1_")
  .bindings(...visibilityForId("$button_id"));

/** Opponent actor button with visibility check */
export const opponentActorDetailsButtonCheckId = element(
  "opponent_actor_details_button_check_id"
)
  .extends(`${NS}.opponent_actor_button`)
  .variableDefault("button_id", "b:opponent_1_")
  .bindings(...visibilityForId("$button_id"));

// Add opponent displays
const opponentIds = ["§0§0§1", "§0§0§2", "§0§0§3", "§0§0§4"];
export const opponentActorDetailsButton = stackPanel(
  "opponent_actor_details_button",
  "vertical"
)
  .size("default", "100%c")
  .offset("-50%", "10%");

const opponentControls: ElementBuilder[] = [];
for (const id of opponentIds) {
  opponentControls.push(
    extend(
      (opponentControls.length + 1).toString(),
      opponentActorDetailsButtonCheckId
    ).variable("button_id", id)
  );
}
opponentActorDetailsButton.controls(...opponentControls);

// Add ally displays
const allyIds = ["§0§a§1", "§0§a§2", "§0§a§3", "§0§a§4"];
export const allyActorDetailsButton = stackPanel(
  "ally_actor_details_button",
  "vertical"
)
  .size("default", "100%c")
  .offset("50%", "10%");

const allyControls: ElementBuilder[] = [];
for (const id of allyIds) {
  allyControls.push(
    extend(
      (allyControls.length + 1).toString(),
      allyActorDetailsButtonCheckId
    ).variable("button_id", id)
  );
}
allyActorDetailsButton.controls(...allyControls);

/**
 * Helper to add all actor elements to namespace
 */
export function addActorElements(add: (builder: ElementBuilder) => void): void {
  add(battleActorEntityIconOverlay);
  add(battleActorDescription);
  add(battleActorButton);
  add(allyActorButton);
  add(opponentActorButton);
  add(allyActorDetailsButtonCheckId);
  add(opponentActorDetailsButtonCheckId);
  add(opponentActorDetailsButton);
  add(allyActorDetailsButton);
}
