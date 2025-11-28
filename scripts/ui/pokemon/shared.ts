/**
 * Shared Pokemon UI Utilities
 *
 * Common helpers and patterns used across pokemon UI screens.
 */

import {
  stackPanel,
  collectionBinding,
  collectionDetailsBinding,
  viewBinding,
  factoryBindings,
  buttonFlagVisibility,
  strip,
  skip,
  type Binding,
  type ElementBuilder,
} from "mcbe-ts-ui";

// =============================================================================
// Visibility Helpers
// =============================================================================

/**
 * Creates visibility bindings for a button by ID.
 * Checks if the button ID matches in the form_buttons collection.
 */
export const visibilityForId = (id: string): Binding[] =>
  buttonFlagVisibility(id, "form_buttons");

// =============================================================================
// Collection Bindings
// =============================================================================

/**
 * Collection details binding for form_buttons.
 * Used to bind button data from the form_buttons collection.
 */
export const formButtonsDetailsBinding = (): Binding =>
  collectionDetailsBinding("form_buttons");

/**
 * Standard form button text collection binding.
 */
export const formButtonTextBinding = (): Binding =>
  collectionBinding("#form_button_text");

/**
 * Standard form button texture collection binding.
 */
export const formButtonTextureBinding = (targetName?: string): Binding =>
  collectionBinding("#form_button_texture", "form_buttons", targetName);

/**
 * Standard form button texture file system binding.
 */
export const formButtonTextureFileSystemBinding = (): Binding =>
  collectionBinding(
    "#form_button_texture_file_system",
    "form_buttons",
    "#texture_file_system"
  );

// =============================================================================
// Button Stack Factory
// =============================================================================

/**
 * Creates a button stack panel factory for dynamic button generation.
 * This is the standard pattern used across pokemon UIs for form buttons.
 *
 * @param name - Element name (default: "button_stack")
 * @param defaultButton - Default button template to use (default: "default_form.button")
 */
export const createButtonStack = (
  name = "button_stack",
  defaultButton = "default_form.button"
): ElementBuilder<string> =>
  stackPanel(name, "vertical")
    .size("default", "100%c")
    .anchor("top_left")
    .variableDefault("button", defaultButton)
    .factory("buttons", "$button")
    .collectionName("form_buttons")
    .bindings(...factoryBindings());

/**
 * Standard button stack factory with default settings.
 */
export const buttonStack = createButtonStack();

// =============================================================================
// Base Button Bindings
// =============================================================================

/**
 * Creates bindings for a form button that checks enabled state.
 * Standard pattern: first char 't' = enabled, 'f' = disabled.
 */
export const formButtonEnabledBindings = (): Binding[] => [
  {
    binding_name: "#null",
    binding_type: "collection_details",
    binding_collection_name: "form_buttons",
  } as Binding,
  formButtonTextBinding(),
  viewBinding("((%.1s * #form_button_text) = 't')", "#enabled"),
];

/**
 * Creates bindings for button text display.
 * Strips and skips the first 25 characters (button metadata prefix).
 */
export const formButtonTextLabelBindings = (skipChars = 25): Binding[] => [
  formButtonTextBinding(),
  viewBinding(strip(skip(skipChars, "#form_button_text")), "#text"),
];

/**
 * Creates bindings for button image display.
 */
export const formButtonImageBindings = (): Binding[] => [
  formButtonTextureBinding("#texture"),
  formButtonTextureFileSystemBinding(),
];

// =============================================================================
// Button Texture Configuration
// =============================================================================

/**
 * Button texture configuration interface.
 */
export interface ButtonTextureConfig {
  default: string;
  hover: string;
  pressed: string;
  locked: string;
}

/**
 * Creates raw button texture properties for a button variant.
 */
export const buttonTextureProps = (config: ButtonTextureConfig) => ({
  $default_button_texture: config.default,
  $hover_button_texture: config.hover,
  $pressed_button_texture: config.pressed,
  $locked_button_texture: config.locked,
});

/**
 * Creates a simple button texture config where hover differs
 * and pressed/locked use the default texture.
 */
export const simpleButtonTextures = (
  basePath: string,
  name: string
): ButtonTextureConfig => ({
  default: `${basePath}/${name}`,
  hover: `${basePath}/${name}_hover`,
  pressed: `${basePath}/${name}`,
  locked: `${basePath}/${name}_disabled`,
});

// =============================================================================
// Button State Variables
// =============================================================================

/** Default button state panel configuration */
export const defaultStateVars = {
  $new_ui_button_texture: "$default_button_texture",
  $text_color: "$default_text_color",
  $secondary_text_color: "$light_button_secondary_default_text_color",
  $content_alpha: "$default_content_alpha",
  $border_color: "$light_border_default_color",
  $border_layer: 2,
  $default_state: true,
  $button_alpha: "$default_button_alpha",
  layer: 1,
};

/** Hover button state panel configuration */
export const hoverStateVars = {
  $new_ui_button_texture: "$hover_button_texture",
  $text_color: "$hover_text_color",
  $secondary_text_color: "$light_button_secondary_hover_text_color",
  $content_alpha: 1,
  $border_color: "$light_border_hover_color",
  $border_layer: 4,
  $hover_state: true,
  $button_alpha: "$default_hover_alpha",
  layer: 4,
};

/** Pressed button state panel configuration */
export const pressedStateVars = {
  $new_ui_button_texture: "$pressed_button_texture",
  $text_color: "$pressed_text_color",
  $secondary_text_color: "$light_button_secondary_pressed_text_color",
  "$button_offset|default": "$button_pressed_offset",
  $content_alpha: "$pressed_alpha",
  $border_color: "$light_border_pressed_color",
  $border_layer: 5,
  $pressed_state: true,
  $button_alpha: "$default_pressed_alpha",
  layer: 5,
};

/** Locked button state panel configuration */
export const lockedStateVars = {
  $new_ui_button_texture: "$locked_button_texture",
  $text_color: "$locked_text_color",
  $secondary_text_color: "$light_button_secondary_locked_text_color",
  $content_alpha: "$locked_alpha",
  $border_color: "$light_border_locked_color",
  $button_image: "common_buttons.locked_button_image",
  $border_layer: 1,
  $locked_state: true,
  layer: 1,
};

// =============================================================================
// Shared Elements Registration
// =============================================================================

/**
 * Helper to add all shared elements to a namespace.
 */
export function addSharedElements(
  add: (builder: ElementBuilder<string>) => void
): void {
  add(buttonStack);
}
