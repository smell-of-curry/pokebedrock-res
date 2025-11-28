/**
 * Battle UI Shared Utilities
 *
 * Shared helpers and elements specific to the battle/attack screen.
 * Re-exports common utilities from parent shared module.
 */

import {
  image,
  custom,
  collectionBinding,
  viewBinding,
  type ElementBuilder,
} from "mcbe-ts-ui";

// Re-export common utilities from parent shared module
export {
  visibilityForId,
  formButtonsDetailsBinding,
  formButtonTextBinding,
  formButtonTextureBinding,
  buttonStack,
  createButtonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  buttonTextureProps,
  simpleButtonTextures,
  defaultStateVars,
  hoverStateVars,
  pressedStateVars,
  lockedStateVars,
  type ButtonTextureConfig,
} from "../shared";

import { formButtonsDetailsBinding } from "../shared";

/** Namespace constant for battle UI */
export const NS = "battle";

/**
 * Hover text tooltip element using custom renderer
 */
const hoverTextTooltip = custom("hover_text")
  .renderer("hover_text_renderer")
  .allowClipping(false)
  .layer(30)
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      "(#form_button_text - (('%.' + $hover_text_index + 's') * #form_button_text))",
      "#hover_text"
    ),
    formButtonsDetailsBinding()
  );

/**
 * Button hover control with tooltip
 */
export const buttonHoverControl = image(
  "button_hover_control",
  "$new_ui_button_texture"
)
  .variableDefault("hover_text_index", 0)
  .controls(hoverTextTooltip);

/**
 * Helper to add all shared elements to namespace
 */
export function addSharedElements(
  add: (builder: ElementBuilder) => void
): void {
  add(buttonStack);
  add(buttonHoverControl);
}
