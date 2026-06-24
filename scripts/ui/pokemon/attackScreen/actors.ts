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
  extend,
  type NamespaceElement,
  type SizeValue,
  type ElementBuilder,
  NamespaceBuilder,
} from "mcbe-ts-ui";

import { visibilityForId, formButtonsDetailsBinding } from "./shared";
import { createDynamicProgressBar, type ProgressElements } from "./progress";

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

/** Battle actor entity icon overlay builder */
const battleActorEntityIconOverlay = image(
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

/** Creates HP bar panel with dynamic progress bar */
function createHpBarPanel(progressElements: ProgressElements) {
  return panel("hp_bar")
    .size("default", "21%")
    .layer(30)
    .controls(
      healthTextLabel,
      createDynamicProgressBar(progressElements.variableProgressBar)
    );
}

/** Creates battle actor description - shows name and HP bar */
function createBattleActorDescription(progressElements: ProgressElements) {
  return stackPanel("battle_actor_description", "vertical")
    .size("default", 40)
    .variableDefault("text_alignment", "left")
    .variableDefault("text_offset", [0, 0])
    .controls(
      spacerPanel("3%"),
      detailsTextLabel,
      spacerPanel("3%"),
      createHpBarPanel(progressElements)
    );
}

// =============================================================================
// Actor Elements Interface and Registration
// =============================================================================

export interface ActorElements {
  battleActorEntityIconOverlay: NamespaceElement;
  battleActorDescription: NamespaceElement;
  battleActorButton: NamespaceElement;
  allyActorButton: NamespaceElement;
  opponentActorButton: NamespaceElement;
  allyActorDetailsButtonCheckId: NamespaceElement;
  opponentActorDetailsButtonCheckId: NamespaceElement;
  opponentActorDetailsButton: NamespaceElement;
  allyActorDetailsButton: NamespaceElement;
}

/**
 * Register all actor elements to namespace and return references
 */
export function registerActorElements(
  ns: NamespaceBuilder,
  progressElements: ProgressElements
): ActorElements {
  // Register entity icon overlay
  const battleActorEntityIconOverlayNs =
    battleActorEntityIconOverlay.addToNamespace(ns);

  // Register actor description
  const battleActorDescriptionNs =
    createBattleActorDescription(progressElements).addToNamespace(ns);

  // Battle actor button base - extends common.button
  const battleActorButtonNs = element("battle_actor_button")
    .extends("common.button")
    .variable("pressed_button_name", "button.form_button_click")
    .variable("default_button_texture", "textures/ui/battle/opponent")
    .variable("hover_button_texture", "textures/ui/battle/opponent")
    .variable("pressed_button_texture", "textures/ui/battle/opponent")
    .variable("locked_button_texture", "textures/ui/battle/opponent")
    .enabled(false)
    .size(90, 42)
    .addToNamespace(ns);

  // Spacing panel for horizontal layout
  const spacingPanel = panel("spacing").size("5%");

  // Ally actor details overlay
  const allyDetailsOverlay = stackPanel(
    "details_overlay",
    "horizontal"
  ).controls(
    extend("description", battleActorDescriptionNs),
    spacingPanel,
    extend("entity_icon_overlay", battleActorEntityIconOverlayNs).variable(
      "actor_icon_overlay_texture",
      "textures/ui/battle/pokemon_healthy"
    )
  );

  // Ally actor button
  const allyActorButtonNs = element("ally_actor_button")
    .extendsFrom(battleActorButtonNs)
    .controls(allyDetailsOverlay)
    .addToNamespace(ns);

  // Opponent actor details overlay
  const opponentDetailsOverlay = stackPanel(
    "details_overlay",
    "horizontal"
  ).controls(
    extend("icon", battleActorEntityIconOverlayNs),
    extend("description", battleActorDescriptionNs)
  );

  // Opponent actor button
  const opponentActorButtonNs = element("opponent_actor_button")
    .extendsFrom(battleActorButtonNs)
    .controls(opponentDetailsOverlay)
    .addToNamespace(ns);

  // Ally actor button with visibility check
  const allyActorDetailsButtonCheckIdNs = element(
    "ally_actor_details_button_check_id"
  )
    .extendsFrom(allyActorButtonNs)
    .variableDefault("button_id", "b:opponent_1_")
    .bindings(...visibilityForId("$button_id"))
    .addToNamespace(ns);

  // Opponent actor button with visibility check
  const opponentActorDetailsButtonCheckIdNs = element(
    "opponent_actor_details_button_check_id"
  )
    .extendsFrom(opponentActorButtonNs)
    .variableDefault("button_id", "b:opponent_1_")
    .bindings(...visibilityForId("$button_id"))
    .addToNamespace(ns);

  // Opponent displays
  const opponentIds = ["§0§0§1", "§0§0§2", "§0§0§3", "§0§0§4"];
  const opponentControls: ElementBuilder<string>[] = opponentIds.map(
    (id, index) =>
      extend(String(index + 1), opponentActorDetailsButtonCheckIdNs).variable(
        "button_id",
        id
      )
  );

  const opponentActorDetailsButtonNs = stackPanel(
    "opponent_actor_details_button",
    "vertical"
  )
    .size("default", "100%c")
    .offset("-50%", "10%")
    .controls(...opponentControls)
    .addToNamespace(ns);

  // Ally displays
  const allyIds = ["§0§a§1", "§0§a§2", "§0§a§3", "§0§a§4"];
  const allyControls: ElementBuilder<string>[] = allyIds.map((id, index) =>
    extend(String(index + 1), allyActorDetailsButtonCheckIdNs).variable(
      "button_id",
      id
    )
  );

  const allyActorDetailsButtonNs = stackPanel(
    "ally_actor_details_button",
    "vertical"
  )
    .size("default", "100%c")
    .offset("50%", "10%")
    .controls(...allyControls)
    .addToNamespace(ns);

  return {
    battleActorEntityIconOverlay: battleActorEntityIconOverlayNs,
    battleActorDescription: battleActorDescriptionNs,
    battleActorButton: battleActorButtonNs,
    allyActorButton: allyActorButtonNs,
    opponentActorButton: opponentActorButtonNs,
    allyActorDetailsButtonCheckId: allyActorDetailsButtonCheckIdNs,
    opponentActorDetailsButtonCheckId: opponentActorDetailsButtonCheckIdNs,
    opponentActorDetailsButton: opponentActorDetailsButtonNs,
    allyActorDetailsButton: allyActorDetailsButtonNs,
  };
}
