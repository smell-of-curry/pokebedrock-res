/**
 * Search Server Form UI
 *
 * Extends the standard long form with a search bar for filtering buttons.
 * Buttons are filtered based on text matching the search input.
 */

import { defineUI } from "mcbe-ts-ui";
import { notPrefix } from "./phud/_string_parser";

export default defineUI("search_server_form", (ns) => {
  // Long form extension
  ns.addRaw("long_form@server_form.long_form", {
    $child_control: "search_server_form.long_form_panel",
  });

  // Long form panel with scrolling
  ns.addRaw("long_form_panel@server_form.long_form_panel", {
    controls: [
      {
        "scrolling_panel@common.scrolling_panel": {
          anchor_to: "top_left",
          anchor_from: "top_left",
          $show_background: false,
          size: ["100%", "100%"],
          $scrolling_content: "search_server_form.long_form_scrolling_content",
          $scroll_size: [5, "100% - 4px"],
          $scrolling_pane_size: ["100% - 4px", "100% - 2px"],
          $scrolling_pane_offset: [2, 0],
          $scroll_bar_right_padding_size: [0, 0],
        },
      },
    ],
  });

  // Scrolling content with search bar
  ns.addRaw("long_form_scrolling_content", {
    type: "stack_panel",
    size: ["100% - 4px", "100%c"],
    orientation: "vertical",
    anchor_from: "top_left",
    anchor_to: "top_left",
    controls: [
      {
        label_offset_panel: {
          type: "panel",
          size: ["100%", "100%c"],
          controls: [
            {
              main_label: {
                type: "label",
                offset: [2, 2],
                color: "$main_header_text_color",
                size: ["100%", "default"],
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: "#form_text",
              },
            },
          ],
        },
      },
      {
        "search_bar@common.text_edit_box": {
          $text_edit_text_control: "search_buttons",
          $place_holder_text: "Search...",
          max_length: 100,
          size: ["100%", 18],
          $text_edit_box_hovered_button_id: "button.search_bar_hovered",
          $text_edit_box_clear_to_button_id: "button.search_bar_clear",
          $text_edit_box_selected_to_button_id: "button.search_bar_selected",
          $text_edit_box_deselected_to_button_id:
            "button.search_bar_deselected",
          focus_wrap_enabled: true,
        },
      },
      {
        padding: {
          type: "panel",
          size: ["100%", 4],
        },
      },
      {
        wrapping_panel: {
          type: "panel",
          size: ["100%", "100%c"],
          controls: [
            {
              "long_form_dynamic_buttons_panel@search_server_form.long_form_dynamic_buttons_panel":
                {},
            },
          ],
        },
      },
    ],
  });

  // Dynamic buttons panel with factory
  ns.addRaw("long_form_dynamic_buttons_panel", {
    type: "stack_panel",
    size: ["100% - 4px", "100%c"],
    offset: [2, 0],
    orientation: "vertical",
    anchor_from: "top_middle",
    anchor_to: "top_middle",
    factory: {
      name: "buttons",
      control_name: "search_server_form.search_template",
    },
    collection_name: "form_buttons",
    bindings: [
      {
        binding_name: "#form_button_length",
        binding_name_override: "#collection_length",
      },
    ],
  });

  // Search template button - filtered by search input
  ns.addRaw("search_template@common_buttons.light_text_button", {
    $pressed_button_name: "button.form_button_click",
    size: ["100%", 32],
    $button_text: "#form_button_text",
    $button_text_binding_type: "collection",
    $button_text_grid_collection_name: "form_buttons",
    $button_text_max_size: ["100%", 30],
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
        source_control_name: "search_buttons",
        source_property_name: "#item_name",
        target_property_name: "#search_em",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name:
          "(((%.1s * #search_em) = '') or ((%.4s * #form_button_text) = 'Back') or (not ((#form_button_text - #search_em) = #form_button_text)))",
        target_property_name: "#visible",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: notPrefix(1, "#form_button_text", " "),
        target_property_name: "#enabled",
      },
    ],
  });
});
