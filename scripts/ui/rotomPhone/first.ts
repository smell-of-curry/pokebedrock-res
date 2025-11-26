/**
 * Rotom Phone First Page UI
 *
 * First page of the Rotom Phone interface with various button groups.
 */

import {
  defineUI,
  panel,
  stackPanel,
  contains,
  collectionBinding,
  factoryBindings,
  viewBinding,
  collectionDetailsBinding,
  imageTextureBindings,
  siblingImageVisibilityBinding,
  globalBinding,
} from "mcbe-ts-ui";

// Button flag prefixes
const FLAGS = {
  image: "§i§i§r",
  top: "§t§r",
  leftBig: "§l§b§r",
  leftBigImage: "§l§b§i§r",
  middleBig: "§m§b§r",
  middleSmall: "§m§s§r",
  bottom: "§b§b§r",
  bottomRight: "§b§s§r",
} as const;

// Button visibility binding
const buttonVisibilityBindings = (flag: string) => [
  collectionBinding("#form_button_text"),
  viewBinding(contains("#form_button_text", flag), "#visible"),
];

export default defineUI("rotom_phone_first", (ns) => {
  // Base button template (raw needed for complex $variable defaults and extends)
  ns.addRaw("button", {
    type: "stack_panel",
    orientation: "vertical",
    size: "$size",
    "$size|default": [14, 8],
    "$size_img|default": [8, 8],
    "$offset_img|default": [0, 0],
    "$anchor_value|default": "bottom_middle",
    "$button_font_scale_factor_value|default": 1,
    "$new_ui_label_offset_value|default": [0, 0],
    "$source_property_flag|default": "",
    bindings: buttonVisibilityBindings("$flag"),
    controls: [
      {
        image_panel: {
          type: "panel",
          size: "$size_img",
          bindings: [siblingImageVisibilityBinding()],
          controls: [
            {
              image: {
                type: "image",
                layer: 99,
                offset: "$offset_img",
                bindings: imageTextureBindings(),
              },
            },
          ],
        },
      },
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          $default_button_texture: "textures/ui/gui/rotom_phone/form_btn_background",
          $hover_button_texture: "textures/ui/gui/rotom_phone/form_btn_background_interact",
          $pressed_button_texture: "textures/ui/gui/rotom_phone/form_btn_background_interact",
          $border_visible: false,
          focus_enabled: false,
          $button_text: "#form_button_text",
          $button_text_binding_type: "collection",
          $button_text_grid_collection_name: "form_buttons",
          $button_text_size: ["100%", "100%"],
          $button_text_max_size: ["100%", "100%"],
          $anchor: "$anchor_value",
          $button_font_scale_factor: "$button_font_scale_factor_value",
          $new_ui_label_offset: "$new_ui_label_offset_value",
          bindings: [collectionDetailsBinding()],
        },
      },
    ],
  });

  // Button panel templates (raw needed for $variable assignments)
  const buttonPanels = [
    { name: "image_button_panel", flag: FLAGS.image, size: [21, 8], sizeImg: [50, 50], offsetImg: [15, -11], sizeType: "100%c", orientation: "horizontal" },
    { name: "top_button_panel", flag: FLAGS.top, sizeType: "100%c", orientation: "horizontal" },
    { name: "left_big_button_panel", flag: FLAGS.leftBig, size: [100, 24], offsetImg: [0, 10], labelOffset: [-10, 0], sizeType: "100%", orientation: "vertical" },
    { name: "left_big_image_button_panel", flag: FLAGS.leftBigImage, size: [100, 24], offsetImg: [0, 10], sizeType: "100%", orientation: "vertical" },
    { name: "middle_big_button_panel", flag: FLAGS.middleBig, size: [50, 20], labelOffset: [5, -3], fontScale: 0.6, sizeType: "100%", orientation: "vertical" },
    { name: "middle_small_button_panel", flag: FLAGS.middleSmall, size: [21, 8], sizeImg: [16, 16], offsetImg: [0, -2], sizeType: "100%c", orientation: "horizontal" },
    { name: "bottom_buttons_panel", flag: FLAGS.bottom, size: [20, 22], sizeType: "100%c", orientation: "horizontal" },
    { name: "bottom_right_button_panel", flag: FLAGS.bottomRight, size: [25, 17], fontScale: 0.5, sizeType: "100%", orientation: "vertical" },
  ];

  buttonPanels.forEach(({ name, flag, size, sizeImg, offsetImg, labelOffset, fontScale, sizeType, orientation }) => {
    const panelBuilder = panel(name).size(sizeType, orientation === "vertical" ? "100%c" : "100%").rawProp("$flag", flag);
    if (size) panelBuilder.rawProp("$size", size);
    if (sizeImg) panelBuilder.rawProp("$size_img", sizeImg);
    if (offsetImg) panelBuilder.rawProp("$offset_img", offsetImg);
    if (labelOffset) panelBuilder.rawProp("$new_ui_label_offset_value", labelOffset);
    if (fontScale) panelBuilder.rawProp("$button_font_scale_factor_value", fontScale);
    panelBuilder.controls({ "button@rotom_phone_first.button": { $source_property_flag: contains("#form_button_text", "$flag") } });
    ns.add(panelBuilder);
  });

  // Button stacks
  const buttonStacks = [
    { name: "image_button", panel: "image_button_panel", orientation: "horizontal", offset: [65, 5] },
    { name: "top_buttons", panel: "top_button_panel", orientation: "horizontal", offset: [113, -27] },
    { name: "left_big_buttons", panel: "left_big_button_panel", orientation: "vertical", offset: [-35, 5], size: ["20%", "100%c"] },
    { name: "left_big_image_buttons", panel: "left_big_image_button_panel", orientation: "vertical", offset: [38, 11], size: ["20%", "100%c"] },
    { name: "middle_big_buttons", panel: "middle_big_button_panel", orientation: "vertical", offset: [25, 10], size: ["20%", "100%c"] },
    { name: "middle_small_buttons", panel: "middle_small_button_panel", orientation: "horizontal", offset: [40, 30] },
    { name: "bottom_buttons", panel: "bottom_buttons_panel", orientation: "horizontal", offset: [-40, 70] },
    { name: "bottom_right_buttons", panel: "bottom_right_button_panel", orientation: "vertical", offset: [46, 67], size: ["20%", "100%c"] },
  ];

  buttonStacks.forEach(({ name, panel: panelName, orientation, offset, size }) => {
    const stackBuilder = stackPanel(name)
      .rawProp("orientation", orientation)
      .size(size ? size[0] : "100%c", size ? size[1] : "20%")
      .offset(...offset)
      .rawProp("factory", { name: "buttons", control_name: `rotom_phone_first.${panelName}` })
      .rawProp("collection_name", "form_buttons")
      .bindings(...factoryBindings());
    ns.add(stackBuilder);
  });

  // Button controller (raw needed for complex nested structure)
  ns.addRaw("button_controller", {
    type: "panel",
    controls: [
      { image: { type: "panel", controls: [{ "image_button@rotom_phone_first.image_button": {} }] } },
      { left_big: { type: "panel", controls: [{ "left_big_buttons@rotom_phone_first.left_big_buttons": {} }] } },
      { left_big_image: { type: "panel", controls: [{ "left_big_image_buttons@rotom_phone_first.left_big_image_buttons": {} }] } },
      { bottom: { type: "panel", controls: [{ "bottom_buttons@rotom_phone_first.bottom_buttons": {} }] } },
      { bottom_right: { type: "panel", controls: [{ "bottom_right_buttons@rotom_phone_first.bottom_right_buttons": {} }] } },
      {
        middle_big: {
          type: "panel",
          controls: [
            { nickname: { type: "label", text: "§fNickname", size: [50, 20], offset: [33, -12], font_scale_factor: 0.65 } },
            { trainer: { type: "label", text: "§fOriginal Trainer", size: [60, 20], offset: [39, 10], font_scale_factor: 0.55 } },
            { "middle_big_buttons@rotom_phone_first.middle_big_buttons": {} },
          ],
        },
      },
      { middle_small: { type: "panel", controls: [{ "middle_small_buttons@rotom_phone_first.middle_small_buttons": {} }] } },
      {
        top: {
          type: "panel",
          controls: [
            { title: { type: "label", layer: 99, size: [30, 15], anchor_from: "top_middle", anchor_to: "top_middle", offset: [47, "39%"], text: "#title_text", font_scale_factor: 0.55, bindings: [globalBinding("#title_text")] } },
            { label: { type: "label", layer: 99, size: [70, 20], anchor_from: "top_middle", anchor_to: "top_middle", offset: [93, "39.5%"], font_scale_factor: 0.8, text: "#form_text" } },
            { "top_buttons@rotom_phone_first.top_buttons": {} },
          ],
        },
      },
    ],
  });

  // Main panel
  ns.add(
    panel("blackbarbar_first").controls(
      { "close_button@common.light_close_button": { $close_button_offset: [-10, 111] } },
      { content: { type: "image", texture: "textures/ui/gui/rotom_phone/first", keep_ratio: true, controls: [{ "button_controller@rotom_phone_first.button_controller": {} }] } }
    )
  );
});
