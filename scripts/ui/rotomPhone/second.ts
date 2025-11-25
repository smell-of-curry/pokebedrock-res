/**
 * Rotom Phone Second Page UI
 *
 * Second page of the Rotom Phone interface - similar to first with different layout.
 * Includes experience points display and additional value labels.
 */

import { defineUI, image, label, panel, stackPanel } from "mcbe-ts-ui";
import { contains } from "../phud/_string_parser";

// Button flag prefixes
const FLAGS = {
  image: "§i§i§r",
  top: "§t§r",
  leftBig: "§l§b§r",
  middleBig: "§m§b§r",
  middleMiddle: "§m§m§r",
  middleSmall: "§m§s§r",
  bottom: "§b§b§r",
  bottomRight: "§b§s§r",
} as const;

// Create button factory binding
const buttonFactoryBinding = () => [
  {
    binding_name: "#form_button_length",
    binding_name_override: "#collection_length",
  },
];

export default defineUI("rotom_phone_second", (ns) => {
  // Base button template
  ns.addRaw("button", {
    type: "stack_panel",
    size: "$size",
    orientation: "vertical",
    "$size|default": [14, 8],
    "$size_img|default": [8, 8],
    "$offset_img|default": [0, 0],
    "$anchor_value|default": "bottom_middle",
    "$button_font_scale_factor_value|default": 1,
    "$new_ui_label_offset_value|default": [0, 0],
    "$source_property_flag|default": "",
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: "$source_property_flag",
        target_property_name: "#visible",
      },
    ],
    controls: [
      {
        image_panel: {
          type: "panel",
          size: "$size_img",
          bindings: [
            {
              binding_type: "view",
              source_control_name: "image",
              resolve_sibling_scope: true,
              source_property_name: "(not (#texture = ''))",
              target_property_name: "#visible",
            },
          ],
          controls: [
            {
              image: {
                type: "image",
                layer: 99,
                offset: "$offset_img",
                bindings: [
                  {
                    binding_name: "#form_button_texture",
                    binding_name_override: "#texture",
                    binding_type: "collection",
                    binding_collection_name: "form_buttons",
                  },
                  {
                    binding_name: "#form_button_texture_file_system",
                    binding_name_override: "#texture_file_system",
                    binding_type: "collection",
                    binding_collection_name: "form_buttons",
                  },
                  {
                    binding_name: "#null",
                    binding_type: "view",
                    source_property_name:
                      "(not ((#texture = '') or (#texture = 'loading')))",
                    target_property_name: "#visible",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          $default_button_texture: "textures/ui/form_btn_background",
          $hover_button_texture: "textures/ui/form_btn_background_interact",
          $pressed_button_texture: "textures/ui/form_btn_background_interact",
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
          bindings: [
            {
              binding_name: "#null",
              binding_type: "collection_details",
              binding_collection_name: "form_buttons",
            },
          ],
        },
      },
    ],
  });

  // Image button panel
  ns.addRaw("image_button_panel", {
    type: "panel",
    size: ["100%c", "100%"],
    $flag: FLAGS.image,
    $size: [21, 8],
    $size_img: [50, 50],
    $offset_img: [15, -11],
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("image_button", {
    type: "stack_panel",
    orientation: "horizontal",
    size: ["100%c", "20%"],
    offset: [65, 5],
    factory: { name: "buttons", control_name: "rotom_phone_second.image_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Top button panel
  ns.addRaw("top_button_panel", {
    type: "panel",
    size: ["100%c", "100%"],
    $flag: FLAGS.top,
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("top_buttons", {
    type: "stack_panel",
    orientation: "horizontal",
    size: ["100%c", "20%"],
    offset: [113, -27],
    factory: { name: "buttons", control_name: "rotom_phone_second.top_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Left big button panel
  ns.addRaw("left_big_button_panel", {
    type: "panel",
    size: ["100%", "100%c"],
    $flag: FLAGS.leftBig,
    $size: [100, 22.5],
    $offset_img: [0, 15],
    $new_ui_label_offset_value: [-15, 0],
    $button_font_scale_factor_value: 0.7,
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("left_big_buttons", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["20%", "100%c"],
    offset: [-55, 26],
    factory: { name: "buttons", control_name: "rotom_phone_second.left_big_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Middle big button panel
  ns.addRaw("middle_big_button_panel", {
    type: "panel",
    size: ["100%", "100%c"],
    $flag: FLAGS.middleBig,
    $size: [50, 20],
    $offset_img: [0, 0],
    $new_ui_label_offset_value: [5, -3],
    $button_font_scale_factor_value: 0.6,
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("middle_big_buttons", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["20%", "100%c"],
    offset: [25, 10],
    factory: { name: "buttons", control_name: "rotom_phone_second.middle_big_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Middle middle button panel
  ns.addRaw("middle_middle_button_panel", {
    type: "panel",
    size: ["100%", "100%c"],
    $flag: FLAGS.middleMiddle,
    $size: [50, 20],
    $offset_img: [0, 0],
    $new_ui_label_offset_value: [5, -3],
    $button_font_scale_factor_value: 0.6,
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("middle_middle_buttons", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["20%", "100%c"],
    offset: [-20, 50],
    factory: { name: "buttons", control_name: "rotom_phone_second.middle_middle_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Middle small button panel
  ns.addRaw("middle_small_button_panel", {
    type: "panel",
    size: ["100%c", "100%"],
    $flag: FLAGS.middleSmall,
    $size: [21, 8],
    $size_img: [16, 16],
    $offset_img: [0, -2],
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("middle_small_buttons", {
    type: "stack_panel",
    orientation: "horizontal",
    size: ["100%c", "20%"],
    offset: [40, 30],
    factory: { name: "buttons", control_name: "rotom_phone_second.middle_small_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Bottom button panel
  ns.addRaw("bottom_buttons_panel", {
    type: "panel",
    size: ["100%c", "100%"],
    $flag: FLAGS.bottom,
    $size: [20, 22],
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("bottom_buttons", {
    type: "stack_panel",
    orientation: "horizontal",
    size: ["100%c", "20%"],
    offset: [-40, 70],
    factory: { name: "buttons", control_name: "rotom_phone_second.bottom_buttons_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Bottom right button panel
  ns.addRaw("bottom_right_button_panel", {
    type: "panel",
    size: ["100%", "100%c"],
    $flag: FLAGS.bottomRight,
    $size: [25, 17],
    $button_font_scale_factor_value: 0.5,
    controls: [
      {
        "button@rotom_phone_second.button": {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      },
    ],
  });

  ns.addRaw("bottom_right_buttons", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["20%", "100%c"],
    offset: [46, 67],
    factory: { name: "buttons", control_name: "rotom_phone_second.bottom_right_button_panel" },
    collection_name: "form_buttons",
    bindings: buttonFactoryBinding(),
  });

  // Button controller
  ns.addRaw("button_controller", {
    type: "panel",
    controls: [
      { image: { type: "panel", controls: [{ "image_button@rotom_phone_second.image_button": {} }] } },
      {
        left_big: {
          type: "panel",
          controls: [
            { value1: { type: "label", text: "§fValue 1", size: [50, 20], offset: [-68, -27], font_scale_factor: 0.55 } },
            { exp_label: { type: "label", text: "§fExp. Points:", size: [50, 20], offset: [-71, -17], font_scale_factor: 0.7 } },
            { value2: { type: "label", text: "§fValue 2", size: [50, 20], offset: [-62, 8], font_scale_factor: 0.55 } },
            { value3: { type: "label", text: "§fValue 3", size: [50, 20], offset: [-62, 30], font_scale_factor: 0.55 } },
            { value4: { type: "label", text: "§fValue 4", size: [50, 20], offset: [-60, 53], font_scale_factor: 0.55 } },
            { "left_big_buttons@rotom_phone_second.left_big_buttons": {} },
          ],
        },
      },
      { bottom: { type: "panel", controls: [{ "bottom_buttons@rotom_phone_second.bottom_buttons": {} }] } },
      { bottom_right: { type: "panel", controls: [{ "bottom_right_buttons@rotom_phone_second.bottom_right_buttons": {} }] } },
      {
        middle_big: {
          type: "panel",
          controls: [
            { nickname: { type: "label", text: "§fNickname", size: [50, 20], offset: [40, -12], font_scale_factor: 0.65 } },
            { trainer: { type: "label", text: "§fOriginal Trainer", size: [60, 20], offset: [39, 10], font_scale_factor: 0.55 } },
            { "middle_big_buttons@rotom_phone_second.middle_big_buttons": {} },
          ],
        },
      },
      {
        middle_middle: {
          type: "panel",
          controls: [
            { value7: { type: "label", text: "§fValue 7", size: [50, 20], offset: [-7, 30], font_scale_factor: 0.65 } },
            { value8: { type: "label", text: "§fValue 8", size: [50, 20], offset: [-5, 52], font_scale_factor: 0.65 } },
            { "middle_middle_buttons@rotom_phone_second.middle_middle_buttons": {} },
          ],
        },
      },
      { middle_small: { type: "panel", controls: [{ "middle_small_buttons@rotom_phone_second.middle_small_buttons": {} }] } },
      {
        top: {
          type: "panel",
          controls: [
            {
              title: {
                type: "label",
                layer: 99,
                size: [30, 15],
                anchor_from: "top_middle",
                anchor_to: "top_middle",
                offset: [47, "39%"],
                text: "#title_text",
                font_scale_factor: 0.55,
                bindings: [{ binding_name: "#title_text", binding_type: "global" }],
              },
            },
            {
              label: {
                type: "label",
                layer: 99,
                size: [70, 20],
                anchor_from: "top_middle",
                anchor_to: "top_middle",
                offset: [93, "39.5%"],
                font_scale_factor: 0.8,
                text: "#form_text",
              },
            },
            { "top_buttons@rotom_phone_second.top_buttons": {} },
          ],
        },
      },
    ],
  });

  // Main panel
  ns.add(
    panel("blackbarbar_second").controls(
      { "close_button@common.light_close_button": { $close_button_offset: [-10, 111] } },
      {
        content: {
          type: "image",
          texture: "textures/ui/gui/rotom_phone/second",
          keep_ratio: true,
          controls: [{ "button_controller@rotom_phone_second.button_controller": {} }],
        },
      }
    )
  );
});

