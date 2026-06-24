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
  type NamespaceBuilder,
  type NamespaceElement,
} from "mcbe-ts-ui";

// Re-export common utilities from parent shared module
export {
  visibilityForId,
  formButtonsDetailsBinding,
  formButtonTextBinding,
  formButtonTextureBinding,
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

import { buttonStack, formButtonsDetailsBinding } from "../shared";

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

// Store registered namespace elements for cross-module access
export interface SharedElements {
  buttonStack: NamespaceElement;
  buttonHoverControl: NamespaceElement;
}

/**
 * Register all shared elements to namespace and return references
 */
export function registerSharedElements(ns: NamespaceBuilder): SharedElements {
  return {
    buttonStack: buttonStack.addToNamespace(ns),
    buttonHoverControl: buttonHoverControl.addToNamespace(ns),
  };
}
