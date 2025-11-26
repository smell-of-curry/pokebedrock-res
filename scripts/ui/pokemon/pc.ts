/**
 * PC Storage UI
 *
 * Pokemon PC box storage interface with navigation and action buttons.
 */

import {
  defineUI,
  stackPanel,
  collectionBinding,
  viewBinding,
  factoryBindings,
  buttonFlagVisibility,
  globalBinding,
} from "mcbe-ts-ui";
import { skip, first, strip, type Binding } from "mcbe-ts-ui";

// Visibility binding helper for button ID
const visibilityForId = (id: string): Binding[] =>
  buttonFlagVisibility(id, "form_buttons");

export default defineUI("pc", (ns) => {
  // Button stack factory
  ns.add(
    stackPanel("button_stack")
      .size("100%", "100%c")
      .vertical()
      .anchor("top_left")
      .rawProp("$button|default", "default_form.button")
      .rawProp("factory", { name: "buttons", control_name: "$button" })
      .rawProp("collection_name", "form_buttons")
      .bindings(...factoryBindings())
  );

  // Base button template
  ns.addRaw("button", {
    type: "panel",
    size: ["100%", "100%"],
    "$offset|default": ["0%", "0%"],
    "$text_offset|default": ["0%", "0%"],
    "$text_anchor_location|default": "center",
    "$text_alignment|default": "left",
    "$text_font_scale_factor|default": 0.6,
    "$image_size|default": ["0%", "0%"],
    "$image_offset|default": ["0%", "0%"],
    controls: [
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          anchor_from: "center",
          anchor_to: "center",
          size: ["100%", "100%"],
          offset: "$offset",
          bindings: [
            {
              binding_name: "#null",
              binding_type: "collection_details",
              binding_collection_name: "form_buttons",
            },
            collectionBinding("#form_button_text"),
            viewBinding("((%.1s * #form_button_text) = 't')", "#enabled"),
          ],
        },
      },
      {
        text: {
          type: "label",
          size: ["100%", "100%"],
          offset: "$text_offset",
          layer: 10,
          anchor_from: "$text_anchor_location",
          anchor_to: "$text_anchor_location",
          text: "#text",
          font_scale_factor: "$text_font_scale_factor",
          text_alignment: "$text_alignment",
          color: "white",
          bindings: [
            collectionBinding("#form_button_text"),
            viewBinding(strip(skip(25, "#form_button_text")), "#text"),
          ],
        },
      },
      {
        image: {
          type: "image",
          size: "$image_size",
          offset: "$image_offset",
          layer: 11,
          bindings: [
            collectionBinding(
              "#form_button_texture",
              "form_buttons",
              "#texture"
            ),
            collectionBinding(
              "#form_button_texture_file_system",
              "form_buttons",
              "#texture_file_system"
            ),
          ],
        },
      },
    ],
  });

  // Button variants
  ns.addRaw("left_arrow_button@pc.button", {
    $default_button_texture: "textures/ui/pc/left_arrow",
    $hover_button_texture: "textures/ui/pc/left_arrow_hover",
    $pressed_button_texture: "textures/ui/pc/left_arrow",
    $locked_button_texture: "textures/ui/pc/left_arrow_disabled",
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:left_arrow"),
  });

  ns.addRaw("right_arrow_button@pc.button", {
    $default_button_texture: "textures/ui/pc/right_arrow",
    $hover_button_texture: "textures/ui/pc/right_arrow_hover",
    $pressed_button_texture: "textures/ui/pc/right_arrow",
    $locked_button_texture: "textures/ui/pc/right_arrow_disabled",
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:right_arrow"),
  });

  ns.addRaw("icon_button@pc.button", {
    $default_button_texture: "textures/ui/pc/icon_box",
    $hover_button_texture: "textures/ui/pc/icon_box",
    $pressed_button_texture: "textures/ui/pc/icon_box",
    $locked_button_texture: "textures/ui/pc/icon_box",
    $image_size: [54, 54],
    $image_offset: [0, -7],
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:icon"),
  });

  ns.addRaw("action_button@pc.button", {
    $default_button_texture: "textures/ui/pc/action_button",
    $hover_button_texture: "textures/ui/pc/action_button_hover",
    $pressed_button_texture: "textures/ui/pc/action_button",
    $locked_button_texture: "textures/ui/pc/action_button",
    $text_offset: [0, -3],
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:action"),
  });

  // Main PC layout
  ns.addRaw("main", {
    type: "stack_panel",
    orientation: "horizontal",
    size: ["100%", "100%"],
    offset: ["25%", "25%"],
    anchor_from: "center",
    anchor_to: "center",
    controls: [
      // Left content box (info panel)
      {
        left_content_box: {
          type: "image",
          size: [73, 115],
          texture: "textures/ui/pc/content_box",
          controls: [
            {
              "close_button@common.light_close_button": {
                $close_button_offset: [3, -3],
              },
            },
            {
              content_stack: {
                type: "stack_panel",
                orientation: "vertical",
                size: ["100%", "100%"],
                offset: [5, 4],
                controls: [
                  {
                    header_text: {
                      type: "label",
                      size: [64, 8],
                      font_scale_factor: 0.7,
                      color: "white",
                      offset: [3, 0],
                      anchor_from: "top_left",
                      anchor_to: "top_left",
                      text: "#text",
                      text_alignment: "center",
                      bindings: [
                        globalBinding("#form_text"),
                        viewBinding(strip(first(40, "#form_text")), "#text"),
                      ],
                    },
                  },
                  {
                    body_text: {
                      type: "label",
                      size: [64, 95],
                      font_scale_factor: 0.6,
                      color: "white",
                      anchor_from: "top_left",
                      anchor_to: "top_left",
                      text: "#text",
                      bindings: [
                        globalBinding("#form_text"),
                        viewBinding(strip(skip(40, "#form_text")), "#text"),
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { spacer1: { type: "panel", size: [2, "100%"] } },
      // Center grid
      {
        center_grid: {
          type: "stack_panel",
          orientation: "vertical",
          size: [116, "100%c"],
          controls: [
            {
              title_box: {
                type: "image",
                size: ["100%", 17],
                texture: "textures/ui/pc/title_box",
                controls: [
                  {
                    box_details: {
                      type: "stack_panel",
                      orientation: "horizontal",
                      size: ["100%", "100%"],
                      controls: [
                        {
                          start_padding: { type: "panel", size: [5, "100%"] },
                        },
                        {
                          "left_button@pc.button_stack": {
                            size: [11, "100%"],
                            layer: 3,
                            anchor_from: "center",
                            anchor_to: "center",
                            $button: "pc.left_arrow_button",
                          },
                        },
                        {
                          title: {
                            type: "panel",
                            size: [84, "100%"],
                            offset: [0, 7],
                            layer: 3,
                            controls: [
                              {
                                text: {
                                  type: "label",
                                  text: "#title_text",
                                  text_alignment: "center",
                                  font_scale_factor: 0.95,
                                },
                              },
                            ],
                          },
                        },
                        {
                          "right_button@pc.button_stack": {
                            size: [11, "100%"],
                            layer: 3,
                            anchor_from: "center",
                            anchor_to: "center",
                            $button: "pc.right_arrow_button",
                          },
                        },
                        { end_padding: { type: "panel", size: [5, "100%"] } },
                      ],
                    },
                  },
                ],
              },
            },
            { spacer1: { type: "panel", size: ["100%", 1] } },
            {
              container_slots: {
                type: "image",
                size: ["100%", 105],
                texture: "textures/ui/pc/container_slots",
                controls: [
                  {
                    small_chest_grid: {
                      type: "grid",
                      grid_dimensions: [6, 6],
                      size: [108, 118],
                      offset: [5, 5],
                      anchor_from: "top_left",
                      anchor_to: "top_left",
                      grid_item_template: "chest_ui.chest_item",
                      collection_name: "form_buttons",
                      layer: 1,
                    },
                  },
                ],
              },
            },
            { spacer2: { type: "panel", size: ["100%", 1.5] } },
            {
              party_slots: {
                type: "image",
                size: ["100%", 26],
                texture: "textures/ui/pc/party_slots",
              },
            },
          ],
        },
      },
      { spacer2: { type: "panel", size: [1, "100%"] } },
      // Right content (icon and action)
      {
        right_content: {
          type: "stack_panel",
          orientation: "vertical",
          size: [71, "100%c"],
          controls: [
            {
              "icon_box@pc.button_stack": {
                size: ["100%", 70],
                layer: 3,
                anchor_from: "center",
                anchor_to: "center",
                $button: "pc.icon_button",
              },
            },
            { spacer: { type: "panel", size: ["100%", 0.5] } },
            {
              "action_button@pc.button_stack": {
                size: ["100%", 18],
                layer: 3,
                anchor_from: "center",
                anchor_to: "center",
                $button: "pc.action_button",
              },
            },
          ],
        },
      },
    ],
  });
});
