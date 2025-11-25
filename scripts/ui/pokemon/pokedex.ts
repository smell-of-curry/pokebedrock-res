/**
 * Pokedex UI
 *
 * Pokedex interface with:
 * - Main grid view with Pokemon icons
 * - Search button
 * - Navigation buttons (previous/next page)
 * - Stats buttons (caught, seen, completion)
 * - Detail view for individual Pokemon
 */

import { defineUI, image, label, panel, stackPanel, grid } from "mcbe-ts-ui";
import { skip, first, strip, contains } from "../phud/_string_parser";

export default defineUI("pokedex", (ns) => {
  // Button stack factory
  ns.addRaw("button_stack", {
    type: "stack_panel",
    size: ["100%", "100%c"],
    orientation: "vertical",
    anchor_from: "top_left",
    anchor_to: "top_left",
    "$button|default": "default_form.button",
    factory: {
      name: "buttons",
      control_name: "$button",
    },
    collection_name: "form_buttons",
    bindings: [
      {
        binding_name: "#form_button_length",
        binding_name_override: "#collection_length",
      },
    ],
  });

  // Base button template
  ns.addRaw("button", {
    type: "panel",
    size: ["100%", "100%"],
    "$offset|default": ["0%", "0%"],
    "$text_offset|default": ["0%", "0%"],
    "$text_anchor_location|default": "center",
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
            {
              binding_type: "collection",
              binding_collection_name: "form_buttons",
              binding_condition: "none",
              binding_name: "#form_button_text",
              binding_name_override: "#form_button_text",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name: "((%.1s * #form_button_text) = 't')",
              target_property_name: "#enabled",
            },
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
          font_scale_factor: 0.6,
          color: "white",
          bindings: [
            {
              binding_type: "collection",
              binding_collection_name: "form_buttons",
              binding_condition: "none",
              binding_name: "#form_button_text",
              binding_name_override: "#form_button_text",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name: strip(skip(25, "#form_button_text")),
              target_property_name: "#text",
            },
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
          ],
        },
      },
    ],
  });

  // Search button
  ns.addRaw("search_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_6",
    $hover_button_texture: "textures/ui/pokedex/Button_6_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_6",
    $locked_button_texture: "textures/ui/pokedex/Button_6_disabled",
    $button_image_fill: true,
    $text_anchor_location: "left_middle",
    $text_offset: ["3%", "20%"],
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:search_button"),
        target_property_name: "#visible",
      },
    ],
  });

  // Back button
  ns.addRaw("back_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_7",
    $hover_button_texture: "textures/ui/pokedex/Button_7_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_7",
    $locked_button_texture: "textures/ui/pokedex/Button_7_disabled",
    $button_image_fill: true,
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:back_button"),
        target_property_name: "#visible",
      },
    ],
  });

  // Icon button (transparent background for Pokemon sprites)
  ns.addRaw("icon@pokedex.button", {
    $default_button_texture: "textures/ui/battle/white_transparency",
    $hover_button_texture: "textures/ui/battle/white_transparency",
    $pressed_button_texture: "textures/ui/battle/white_transparency",
    $locked_button_texture: "textures/ui/battle/white_transparency",
    $image_size: ["100%", "100%"],
    $button_image_fill: true,
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:icon"),
        target_property_name: "#visible",
      },
    ],
  });

  // Previous page button
  ns.addRaw("previous_page_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_1",
    $hover_button_texture: "textures/ui/pokedex/Button_1_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_1",
    $locked_button_texture: "textures/ui/pokedex/Button_1_disabled",
    $button_image_fill: true,
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:previous_page"),
        target_property_name: "#visible",
      },
    ],
  });

  // Next page button
  ns.addRaw("next_page_button@pokedex.button", {
    $offset: ["0px", "-5%"],
    $default_button_texture: "textures/ui/pokedex/Button_2",
    $hover_button_texture: "textures/ui/pokedex/Button_2_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_2",
    $locked_button_texture: "textures/ui/pokedex/Button_2_disabled",
    $button_image_fill: true,
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:next_page"),
        target_property_name: "#visible",
      },
    ],
  });

  // Caught pokemon button
  ns.addRaw("caught_pokemon_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_5",
    $hover_button_texture: "textures/ui/pokedex/Button_5_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_5",
    $locked_button_texture: "textures/ui/pokedex/Button_5_disabled",
    $button_image_fill: true,
    $text_anchor_location: "right_middle",
    $text_offset: ["25%", "27%"],
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:caught_pokemon"),
        target_property_name: "#visible",
      },
    ],
  });

  // Seen pokemon button
  ns.addRaw("seen_pokemon_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_4",
    $hover_button_texture: "textures/ui/pokedex/Button_4_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_4",
    $locked_button_texture: "textures/ui/pokedex/Button_4_disabled",
    $button_image_fill: true,
    $text_anchor_location: "right_middle",
    $text_offset: ["25%", "27%"],
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:seen_pokemon"),
        target_property_name: "#visible",
      },
    ],
  });

  // Completion button
  ns.addRaw("completion_button@pokedex.button", {
    $default_button_texture: "textures/ui/pokedex/Button_3",
    $hover_button_texture: "textures/ui/pokedex/Button_3_green",
    $pressed_button_texture: "textures/ui/pokedex/Button_3",
    $locked_button_texture: "textures/ui/pokedex/Button_3_disabled",
    $button_image_fill: true,
    $text_anchor_location: "right_middle",
    $text_offset: ["25%", "27%"],
    bindings: [
      {
        binding_name: "#form_button_text",
        binding_name_override: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: contains("#form_button_text", "btn:completion_count"),
        target_property_name: "#visible",
      },
    ],
  });

  // Main grid view
  ns.add(
    image("main_grid")
      .texture("textures/ui/pokedex/Orange_gui_resized_and_removed")
      .size(233, 299)
      .anchor("center")
      .controls(
        { "close_button@common.light_close_button": { $close_button_offset: [-10, 111] } },
        {
          "search_button@pokedex.button_stack": {
            size: [163, 12],
            offset: [32, 116],
            layer: 4,
            $button: "pokedex.search_button",
          },
        },
        {
          page_management_buttons: {
            type: "stack_panel",
            orientation: "vertical",
            size: ["100%", "100%"],
            offset: [196, 144],
            controls: [
              {
                "page_management@pokedex.button_stack": {
                  size: [11, 26],
                  layer: 4,
                  $button: "pokedex.previous_page_button",
                },
              },
              {
                "page_management@pokedex.button_stack": {
                  size: [11, 26],
                  layer: 4,
                  $button: "pokedex.next_page_button",
                },
              },
            ],
          },
        },
        {
          pokedex_info_buttons: {
            type: "stack_panel",
            orientation: "horizontal",
            size: ["100%", "100%"],
            offset: [32, 207],
            controls: [
              {
                "caught_pokemon@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.caught_pokemon_button",
                },
              },
              { spacer: { type: "panel", size: [0.5, 17] } },
              {
                "seen_pokemon@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.seen_pokemon_button",
                },
              },
              { spacer_2: { type: "panel", size: [0.5, 17] } },
              {
                "completion@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.completion_button",
                },
              },
            ],
          },
        },
        {
          small_chest_grid: {
            type: "grid",
            grid_dimensions: [9, 4],
            size: [159.8, 73],
            offset: [34, 132],
            anchor_from: "top_left",
            anchor_to: "top_left",
            grid_item_template: "chest_ui.chest_item",
            collection_name: "form_buttons",
            layer: 1,
          },
        }
      )
  );

  // Pokemon details view
  ns.add(
    image("pokemon_details")
      .texture("textures/ui/pokedex/Orange_gui_second_resized_and_removed")
      .size(233, 299)
      .anchor("center")
      .controls(
        { "close_button@common.light_close_button": { $close_button_offset: [-10, 111] } },
        {
          top_details: {
            type: "stack_panel",
            orientation: "horizontal",
            size: ["100%", "100%"],
            offset: [32, 116],
            controls: [
              {
                "back_button@pokedex.button_stack": {
                  size: [22, 12],
                  layer: 4,
                  $button: "pokedex.back_button",
                },
              },
              { spacer: { type: "panel", size: [1, 12] } },
              {
                "search_button@pokedex.button_stack": {
                  size: [146, 12],
                  layer: 4,
                  $button: "pokedex.search_button",
                },
              },
            ],
          },
        },
        {
          details: {
            type: "stack_panel",
            orientation: "vertical",
            size: ["100%", "100%"],
            offset: [35, 133],
            controls: [
              {
                pokemon_name: {
                  type: "label",
                  size: [165, 8],
                  font_scale_factor: 0.6,
                  color: "white",
                  anchor_from: "top_left",
                  anchor_to: "top_left",
                  text: "#text",
                  bindings: [
                    { binding_type: "global", binding_name: "#form_text" },
                    {
                      binding_name: "#null",
                      binding_type: "view",
                      source_property_name: strip(first(40, "#form_text")),
                      target_property_name: "#text",
                    },
                  ],
                },
              },
              {
                spawn_location: {
                  type: "label",
                  size: [165, 6],
                  font_scale_factor: 0.6,
                  color: "white",
                  anchor_from: "top_left",
                  anchor_to: "top_left",
                  text: "#text",
                  bindings: [
                    { binding_type: "global", binding_name: "#form_text" },
                    {
                      binding_name: "#null",
                      binding_type: "view",
                      source_property_name: strip(
                        `(${first(80, "#form_text")} - ${first(40, "#form_text")})`
                      ),
                      target_property_name: "#text",
                    },
                  ],
                },
              },
              {
                pokemon_details: {
                  type: "stack_panel",
                  orientation: "horizontal",
                  size: [165, 54],
                  controls: [
                    {
                      text: {
                        type: "label",
                        size: [110, 55],
                        font_scale_factor: 0.6,
                        color: "white",
                        anchor_from: "top_left",
                        anchor_to: "top_left",
                        text: "#text",
                        bindings: [
                          { binding_type: "global", binding_name: "#form_text" },
                          {
                            binding_name: "#null",
                            binding_type: "view",
                            source_property_name: strip(
                              `(${first(400, "#form_text")} - ${first(80, "#form_text")})`
                            ),
                            target_property_name: "#text",
                          },
                        ],
                      },
                    },
                    {
                      "icon@pokedex.button_stack": {
                        size: [55, 55],
                        $offset: [0, 2],
                        layer: 4,
                        $button: "pokedex.icon",
                      },
                    },
                  ],
                },
              },
            ],
          },
        }
      )
  );
});

