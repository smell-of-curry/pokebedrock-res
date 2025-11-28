/**
 * PC Storage UI
 *
 * Pokemon PC box storage interface with navigation and action buttons.
 */

import {
  defineUI,
  panel,
  image,
  boundImage,
  stackPanel,
  viewBinding,
  globalBinding,
  strip,
  skip,
  first,
  boundLabel,
  grid,
  extendRaw,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  buttonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  simpleButtonTextures,
} from "./shared";

// Base button template
const formButton = panel("form_button")
  .extends("common_buttons.light_text_button")
  .variable("pressed_button_name", "button.form_button_click")
  .rawProp("offset", "$offset")
  .bindings(...formButtonEnabledBindings());

const buttonText = boundLabel("text")
  .layer(10)
  .rawProp("offset", "$text_offset")
  .rawProp("anchor_from", "$text_anchor_location")
  .rawProp("anchor_to", "$text_anchor_location")
  .rawProp("font_scale_factor", "$text_font_scale_factor")
  .rawProp("text_alignment", "$text_alignment")
  .color("white")
  .bindings(...formButtonTextLabelBindings());

const buttonImage = boundImage("image")
  .rawProp("size", "$image_size")
  .rawProp("offset", "$image_offset")
  .layer(11)
  .bindings(...formButtonImageBindings());

const actionButtonTextures = simpleButtonTextures(
  "textures/ui/pc",
  "action_button"
);

const leftContentBoxHeader = boundLabel("header_text")
  .size(64, 8)
  .fontScaleFactor(0.7)
  .color("white")
  .offset(3, 0)
  .anchor("top_left")
  .textAlignment("center")
  .bindings(
    globalBinding("#form_text"),
    viewBinding(strip(first(40, "#form_text")), "#text")
  );

const leftContentBoxBody = boundLabel("body_text")
  .size(64, 95)
  .fontScaleFactor(0.6)
  .color("white")
  .anchor("top_left")
  .bindings(
    globalBinding("#form_text"),
    viewBinding(strip(skip(40, "#form_text")), "#text")
  );

const closeButton = extendRaw("close_button", "common.light_close_button", {
  $close_button_offset: [3, -3],
});

const leftContentStack = stackPanel("content_stack", "vertical")
  .offset(5, 4)
  .controls(leftContentBoxHeader, leftContentBoxBody);

const leftContentBox = image("left_content_box", "textures/ui/pc/content_box")
  .size(73, 115)
  .controls(closeButton, leftContentStack);

// Container slots with grid
const smallChestGrid = grid("small_chest_grid")
  .gridDimensions(6, 6)
  .size(108, 118)
  .offset(5, 5)
  .anchor("top_left")
  .gridItemTemplate("chest_ui.chest_item")
  .collectionName("form_buttons")
  .layer(1);

const containerSlotsBackground = image(
  "container_slots",
  "textures/ui/pc/container_slots"
)
  .size("default", 105)
  .controls(smallChestGrid);

const partySlots = image("party_slots", "textures/ui/pc/party_slots").size(
  "default",
  26
);

const titleLabel = boundLabel("text", "title_text")
  .textAlignment("center")
  .fontScaleFactor(0.95);

const title = panel("title")
  .size(84)
  .offset(0, 7)
  .layer(3)
  .controls(titleLabel);

export default defineUI("pc", (ns) => {
  // Register button stack factory from shared module
  const buttonStackNs = buttonStack.addToNamespace(ns);

  // Register button and capture the namespace element for type-safe extension
  const buttonNs = panel("button")
    .variableDefault("offset", ["0%", "0%"])
    .variableDefault("text_offset", ["0%", "0%"])
    .variableDefault("text_anchor_location", "center")
    .variableDefault("text_alignment", "left")
    .variableDefault("text_font_scale_factor", 0.6)
    .variableDefault("image_size", ["0%", "0%"])
    .variableDefault("image_offset", ["0%", "0%"])
    .controls(formButton, buttonText, buttonImage)
    .addToNamespace(ns);

  // Button variants - extending base button with different textures
  const leftArrowTextures = simpleButtonTextures(
    "textures/ui/pc",
    "left_arrow"
  );
  const leftArrowButtonNs = panel("left_arrow_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", leftArrowTextures.default)
    .variable("hover_button_texture", leftArrowTextures.hover)
    .variable("pressed_button_texture", leftArrowTextures.pressed)
    .variable("locked_button_texture", leftArrowTextures.locked)
    .variable("button_image_fill", false)
    .variable("border_visible", false)
    .bindings(...visibilityForId("btn:left_arrow"))
    .addToNamespace(ns);

  const rightArrowTextures = simpleButtonTextures(
    "textures/ui/pc",
    "right_arrow"
  );
  const rightArrowButtonNs = panel("right_arrow_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", rightArrowTextures.default)
    .variable("hover_button_texture", rightArrowTextures.hover)
    .variable("pressed_button_texture", rightArrowTextures.pressed)
    .variable("locked_button_texture", rightArrowTextures.locked)
    .variable("button_image_fill", false)
    .variable("border_visible", false)
    .bindings(...visibilityForId("btn:right_arrow"))
    .addToNamespace(ns);

  // TODO: Make textures type safe.
  const iconBoxTexture = "textures/ui/pc/icon_box";
  const iconButtonNs = panel("icon_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", iconBoxTexture)
    .variable("hover_button_texture", iconBoxTexture)
    .variable("pressed_button_texture", iconBoxTexture)
    .variable("locked_button_texture", iconBoxTexture)
    .variable("image_size", [54, 54])
    .variable("image_offset", [0, -7])
    .variable("button_image_fill", false)
    .variable("border_visible", false)
    .bindings(...visibilityForId("btn:icon"))
    .addToNamespace(ns);

  const actionButtonTemplateNs = panel("action_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", actionButtonTextures.default)
    .variable("hover_button_texture", actionButtonTextures.hover)
    .variable("pressed_button_texture", actionButtonTextures.pressed)
    .variable("locked_button_texture", actionButtonTextures.locked)
    .variable("text_offset", [0, -3])
    .variable("button_image_fill", false)
    .variable("border_visible", false)
    .bindings(...visibilityForId("btn:action"))
    .addToNamespace(ns);

  // Title box with navigation arrows
  const leftButton = panel("left_button")
    .extendsFrom(buttonStackNs)
    .size(11)
    .layer(3)
    .variable("button", leftArrowButtonNs.getQualifiedName());

  const rightButton = panel("right_button")
    .extendsFrom(buttonStackNs)
    .size(11)
    .layer(3)
    .variable("button", rightArrowButtonNs.getQualifiedName());

  const boxDetails = stackPanel("box_details", "horizontal").controls(
    panel("start_padding").size(5),
    leftButton,
    title,
    rightButton,
    panel("end_padding").size(5)
  );

  const titleBox = image("title_box", "textures/ui/pc/title_box")
    .size("default", 17)
    .controls(boxDetails);

  // Center grid stack
  const centerGridNs = stackPanel("center_grid", "vertical")
    .size(116, "100%c")
    .controls(
      titleBox,
      panel("spacer1").size("default", 1),
      containerSlotsBackground,
      panel("spacer2").size("default", 1.5),
      partySlots
    );

  // Right content (icon and action)
  const iconBox = panel("icon_box")
    .extendsFrom(buttonStackNs)
    .size("default", 70)
    .layer(3)
    .variable("button", iconButtonNs.getQualifiedName());

  const actionButtonBox = panel("action_button")
    .extendsFrom(buttonStackNs)
    .size("default", 18)
    .layer(3)
    .variable("button", actionButtonTemplateNs.getQualifiedName());

  const rightContentNs = stackPanel("right_content", "vertical")
    .size(71, "100%c")
    .controls(iconBox, panel("spacer").size("default", 0.5), actionButtonBox);

  // Main PC layout
  const [, finalNs] = ns.add(
    stackPanel("main", "horizontal")
      .offset("25%", "25%")
      .controls(
        leftContentBox,
        panel("spacer1").size(2),
        centerGridNs,
        panel("spacer2").size(1),
        rightContentNs
      )
  );
  return finalNs;
});
