/**
 * Battle UI
 *
 * Pokemon battle interface with:
 * - Battle action buttons (bag, pokemon, run)
 * - Move selection grid
 * - Actor details (opponent and ally pokemon info)
 * - HP bars with dynamic coloring
 */

import { defineUI, image, label, panel, stackPanel } from "mcbe-ts-ui";
import { skip, first, strip, contains } from "../phud/_string_parser";

export default defineUI("battle", (ns) => {
  // Button stack panel factory
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

  // Button hover control with tooltip
  ns.addRaw("button_hover_control", {
    type: "image",
    texture: "$new_ui_button_texture",
    "$hover_text_index|default": 0,
    controls: [
      {
        hover_text: {
          type: "custom",
          renderer: "hover_text_renderer",
          allow_clipping: false,
          layer: 30,
          bindings: [
            {
              binding_name: "#form_button_text",
              binding_type: "collection",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name:
                "(#form_button_text - (('%.' + $hover_text_index + 's') * #form_button_text))",
              target_property_name: "#hover_text",
            },
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

  // Simple button base
  ns.addRaw("simple_button@common_buttons.light_text_button", {
    $pressed_button_name: "button.form_button_click",
    "$size|default": ["100%", "100%"],
    size: "$size",
    anchor_from: "center",
    anchor_to: "center",
    offset: [0, 0],
    $border_visible: false,
    "$hover_text_index|default": 53,
    controls: [
      {
        "default@$button_state_panel": {
          $new_ui_button_texture: "$default_button_texture",
          $text_color: "$default_text_color",
          $secondary_text_color: "$light_button_secondary_default_text_color",
          $content_alpha: "$default_content_alpha",
          $border_color: "$light_border_default_color",
          $border_layer: 2,
          $default_state: true,
          $button_alpha: "$default_button_alpha",
          layer: 1,
        },
      },
      {
        "hover@battle.button_hover_control": {
          $new_ui_button_texture: "$hover_button_texture",
          $text_color: "$hover_text_color",
          $secondary_text_color: "$light_button_secondary_hover_text_color",
          $content_alpha: 1,
          $border_color: "$light_border_hover_color",
          $border_layer: 4,
          $hover_state: true,
          $button_alpha: "$default_hover_alpha",
          layer: 4,
        },
      },
      {
        "pressed@$button_state_panel": {
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
        },
      },
      {
        "locked@$button_state_panel": {
          $new_ui_button_texture: "$locked_button_texture",
          $text_color: "$locked_text_color",
          $secondary_text_color: "$light_button_secondary_locked_text_color",
          $content_alpha: "$locked_alpha",
          $border_color: "$light_border_locked_color",
          $button_image: "common_buttons.locked_button_image",
          $border_layer: 1,
          $locked_state: true,
          layer: 1,
        },
      },
    ],
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
        binding_name: "#form_button_texture",
        binding_name_override: "#form_button_texture",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: "(not((%.1s * #form_button_texture) = 'f'))",
        target_property_name: "#enabled",
      },
    ],
  });

  // Bag button
  ns.addRaw("bag_button", {
    type: "panel",
    size: ["100%", "7%x"],
    offset: ["-45.5%", "-13%"],
    anchor_from: "top_left",
    anchor_to: "top_left",
    controls: [
      {
        "form_button@battle.simple_button": {
          $default_button_texture: "textures/ui/battle/menu_bag",
          $hover_button_texture: "textures/ui/battle/menu_bag_hover",
          $pressed_button_texture: "textures/ui/battle/menu_bag",
          $locked_button_texture: "textures/ui/battle/menu_bag_disabled",
          $hover_text_index: 16,
          $size: ["25%", "80%"],
        },
      },
    ],
  });

  // Party pokemon button
  ns.addRaw("party_pokemon_button", {
    type: "panel",
    size: ["100%", "7%x"],
    offset: ["-45.5%", "-26%"],
    anchor_from: "top_left",
    anchor_to: "top_left",
    controls: [
      {
        "form_button@battle.simple_button": {
          $default_button_texture: "textures/ui/battle/menu_poke",
          $hover_button_texture: "textures/ui/battle/menu_poke_hover",
          $pressed_button_texture: "textures/ui/battle/menu_poke",
          $locked_button_texture: "textures/ui/battle/menu_poke_disabled",
          $hover_text_index: 20,
          $size: ["25%", "80%"],
        },
      },
    ],
  });

  // Run button
  ns.addRaw("run_button", {
    type: "panel",
    size: ["100%", "7%x"],
    offset: ["-45.5%", "-38%"],
    anchor_from: "top_left",
    anchor_to: "top_left",
    controls: [
      {
        "form_button@battle.simple_button": {
          $default_button_texture: "textures/ui/battle/menu_run",
          $hover_button_texture: "textures/ui/battle/menu_run_hover",
          $pressed_button_texture: "textures/ui/battle/menu_run",
          $locked_button_texture: "textures/ui/battle/menu_run_disabled",
          $hover_text_index: 16,
          $size: ["25%", "80%"],
        },
      },
    ],
  });

  // Battle action button (switches between bag, pokemon, run)
  ns.addRaw("battle_action_button", {
    type: "panel",
    size: ["100%", "100%c"],
    $bag_button_id: "battleButton:bag",
    $pokemon_button_id: "battleButton:pokemon",
    $run_button_id: "battleButton:run",
    controls: [
      {
        "bag_button@battle.bag_button": {
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
              source_property_name: contains("#form_button_text", "$bag_button_id"),
              target_property_name: "#visible",
            },
          ],
        },
      },
      {
        "poke_button@battle.party_pokemon_button": {
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
              source_property_name: contains("#form_button_text", "$pokemon_button_id"),
              target_property_name: "#visible",
            },
          ],
        },
      },
      {
        "run_button@battle.run_button": {
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
              source_property_name: contains("#form_button_text", "$run_button_id"),
              target_property_name: "#visible",
            },
          ],
        },
      },
    ],
  });

  // Move selection button
  ns.addRaw("move_selection_button", {
    type: "panel",
    size: ["10%", "60%"],
    anchor_from: "center",
    anchor_to: "center",
    layer: 15,
    controls: [
      {
        "button@battle.simple_button": {
          $default_button_texture: "textures/ui/battle/moveSelectionBadges/background",
          $hover_button_texture: "textures/ui/battle/moveSelection_blank_badge",
          $pressed_button_texture: "textures/ui/battle/moveSelection_blank_badge",
          $locked_button_texture: "textures/ui/battle/moveSelectionBadges/background",
          $border_visible: false,
          $hover_text_index: 27,
        },
      },
      {
        front_image: {
          type: "image",
          alpha: 1,
          size: ["85%", "85%"],
          layer: 16,
          anchor_from: "center",
          anchor_to: "center",
          texture: "#texture",
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
              binding_name: "#form_button_texture",
              binding_name_override: "#form_button_texture",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name: `('textures/ui/battle/moveSelectionBadges/' + ${skip(
                3,
                "#form_button_texture"
              )})`,
              target_property_name: "#texture",
            },
          ],
        },
      },
    ],
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
        source_property_name: contains("#form_button_text", "battleButton:move_selection"),
        target_property_name: "#visible",
      },
    ],
  });

  // PP bar for move display
  ns.addRaw("pp_bar", {
    "$bar|default": "",
    type: "image",
    texture: "textures/ui/battle/white_shaded",
    color: [0.1, 0.6, 1],
    layer: 10,
    anchor_from: "bottom_left",
    anchor_to: "bottom_left",
    fill: true,
    size: ["40%", "29%"],
    offset: ["30.3%", "19%"],
    bindings: [
      {
        binding_type: "collection",
        binding_collection_name: "form_buttons",
        binding_condition: "none",
        binding_name: "#form_button_texture",
        binding_name_override: "#form_button_texture",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: `(${skip(2, "#form_button_texture")} = $bar)`,
        target_property_name: "#visible",
      },
    ],
  });

  // Generate PP bar variants (0-20)
  for (let i = 0; i <= 20; i++) {
    const sizePercent = i === 0 ? "0%" : `${(i * 1.965).toFixed(3)}%`;
    ns.addRaw(`${i}@battle.pp_bar`, {
      $bar: i === 0 ? "_0" : `_${i}`,
      size: [sizePercent, "29%"],
    });
  }

  // Also add null PP bar
  ns.addRaw("null@battle.pp_bar", {
    $bar: "_null",
    size: ["0%", "29%"],
  });

  // Move button
  ns.addRaw("move_button", {
    type: "panel",
    size: ["100%", "7%x"],
    offset: "$offset",
    anchor_from: "top_left",
    anchor_to: "top_left",
    controls: [
      {
        button: {
          type: "panel",
          anchor_from: "center",
          anchor_to: "center",
          size: ["40%", "150%"],
          controls: [
            {
              "form_button@battle.simple_button": {
                $default_button_texture: "textures/ui/battle/moveSelection",
                $hover_button_texture: "textures/ui/battle/moveSelection_hover",
                $pressed_button_texture: "textures/ui/battle/moveSelection",
                $locked_button_texture: "textures/ui/battle/moveSelection_locked",
                $hover_text_index: 98,
              },
            },
          ],
        },
      },
      {
        name: {
          type: "label",
          size: ["100%", "100%"],
          offset: ["40%", "20%"],
          layer: 10,
          anchor_from: "center",
          anchor_to: "center",
          text: "#text",
          localize: true,
          color: "black",
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
              source_property_name: `(${strip(
                `(('showdown.moves' + ${first(30, skip(36, "#form_button_text"))}))`
              )} + '.name')`,
              target_property_name: "#text",
            },
          ],
        },
      },
      {
        icon: {
          type: "image",
          layer: 10,
          size: [20, 20],
          offset: "$icon_offset",
          texture: "#texture",
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
              source_property_name: `${strip(
                `('textures/ui/gui/attacks/' + ${first(8, skip(4, "#form_button_text"))})`
              )}`,
              target_property_name: "#texture",
            },
          ],
        },
      },
      {
        pp_text: {
          type: "label",
          size: ["100%", "100%"],
          offset: ["45%", "92%"],
          layer: 11,
          anchor_from: "center",
          anchor_to: "center",
          text: "#text",
          font_scale_factor: 0.8,
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
              source_property_name: strip(first(7, skip(66, "#form_button_text"))),
              target_property_name: "#text",
            },
          ],
        },
      },
    ],
  });

  // Grid button check ID template
  ns.addRaw("grid_button_check_id@battle.move_button", {
    "$button_id|default": "b:1_",
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
        source_property_name: contains("#form_button_text", "$button_id"),
        target_property_name: "#visible",
      },
    ],
  });

  // Grid button (4 move slots)
  ns.addRaw("grid_button", {
    type: "panel",
    size: ["100%", "100%c"],
    controls: [
      {
        "1@battle.grid_button_check_id": {
          $icon_offset: ["-15%", "-14%"],
          $offset: ["-19%", "25%"],
          $button_id: "b:1_",
        },
      },
      {
        "2@battle.grid_button_check_id": {
          $icon_offset: ["-15%", "-14%"],
          $offset: ["-19%", "80%"],
          $button_id: "b:2_",
        },
      },
      {
        "3@battle.grid_button_check_id": {
          $icon_offset: ["15%", "-14%"],
          $offset: ["21.5%", "-175%"],
          $button_id: "b:3_",
        },
      },
      {
        "4@battle.grid_button_check_id": {
          $icon_offset: ["15%", "-14%"],
          $offset: ["21.5%", "-120%"],
          $button_id: "b:4_",
        },
      },
    ],
  });

  // Variable progress bar for HP
  ns.addRaw("variable_progress_bar", {
    layer: 2,
    clip_pixelperfect: false,
    type: "image",
    texture: "textures/ui/filled_progress_bar",
    clip_direction: "left",
    "$color_id|default": "G",
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
        source_property_name: `( ${first(3, skip(60, "#form_button_text"))} * 1 )`,
        target_property_name: "#clip_ratio",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: `(${first(1, skip(58, "#form_button_text"))} = $color_id)`,
        target_property_name: "#visible",
      },
    ],
  });

  // Dynamic progress bar with color variants
  ns.addRaw("dynamic_progress_bar", {
    type: "panel",
    size: ["100%", "100%"],
    anchor_from: "center",
    anchor_to: "center",
    controls: [
      { "empty_progress_bar@common.empty_progress_bar": { layer: 1 } },
      { "green@battle.variable_progress_bar": { color: [0.5, 1.0, 0.5, 1.0], $color_id: "G" } },
      { "yellow@battle.variable_progress_bar": { color: [1, 0.9, 0, 1.0], $color_id: "Y" } },
      { "red@battle.variable_progress_bar": { color: [1, 0, 0, 1.0], $color_id: "R" } },
    ],
  });

  // Battle actor entity icon overlay
  ns.addRaw("battle_actor_entity_icon_overlay", {
    type: "image",
    size: [40, 40],
    "$actor_icon_overlay_texture|default": "textures/ui/battle/pokemon_warning",
    texture: "$actor_icon_overlay_texture",
    "$actor_icon_offset|default": [0, 0],
    offset: "$actor_icon_offset",
    controls: [
      {
        entity_icon: {
          type: "image",
          size: [40, 40],
          anchor_from: "center",
          anchor_to: "center",
          layer: 25,
          bindings: [
            {
              binding_name: "#null",
              binding_type: "collection_details",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#form_button_texture_file_system",
              binding_name_override: "#texture_file_system",
              binding_type: "collection",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#form_button_texture",
              binding_name_override: "#texture",
              binding_type: "collection",
              binding_collection_name: "form_buttons",
            },
          ],
        },
      },
    ],
  });

  // Battle actor description (name + HP bar)
  ns.addRaw("battle_actor_description", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["100%", 40],
    "$text_alignment|default": "left",
    "$text_offset|default": [0, 0],
    controls: [
      { spacer: { type: "panel", size: ["100%", "3%"] } },
      {
        details_text: {
          type: "label",
          text: "#text",
          color: [0.768, 0.768, 0.768],
          font_scale_factor: 1,
          offset: "$text_offset",
          size: ["100%", "65%"],
          text_alignment: "$text_alignment",
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
              source_property_name: strip(first(58, "#form_button_text")),
              target_property_name: "#text",
            },
          ],
        },
      },
      { spacer: { type: "panel", size: ["100%", "3%"] } },
      {
        hp_bar: {
          type: "panel",
          size: ["100%", "21%"],
          anchor_from: "center",
          anchor_to: "center",
          layer: 30,
          controls: [
            {
              health_text: {
                type: "label",
                text: "#text",
                color: "white",
                font_scale_factor: 0.8,
                size: ["100%", "100%"],
                offset: ["0%", "0%"],
                font_type: "smooth",
                text_alignment: "center",
                layer: 32,
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
                    source_property_name: skip(62, "#form_button_text"),
                    target_property_name: "#text",
                  },
                ],
              },
            },
            { "health_bar@battle.dynamic_progress_bar": {} },
          ],
        },
      },
    ],
  });

  // Battle actor button base
  ns.addRaw("battle_actor_button@common.button", {
    $pressed_button_name: "button.form_button_click",
    $default_button_texture: "textures/ui/battle/opponent",
    $hover_button_texture: "textures/ui/battle/opponent",
    $pressed_button_texture: "textures/ui/battle/opponent",
    $locked_button_texture: "textures/ui/battle/opponent",
    enabled: false,
    size: [90, 42],
  });

  // Ally actor button
  ns.addRaw("ally_actor_button@battle.battle_actor_button", {
    controls: [
      {
        details_overlay: {
          type: "stack_panel",
          orientation: "horizontal",
          size: ["100%", "100%"],
          controls: [
            { "actor_description@battle.battle_actor_description": {} },
            { spacing: { type: "panel", size: ["5%", "100%"] } },
            {
              "entity_icon_overlay@battle.battle_actor_entity_icon_overlay": {
                $actor_icon_overlay_texture: "textures/ui/battle/pokemon_healthy",
              },
            },
          ],
        },
      },
    ],
  });

  // Opponent actor button
  ns.addRaw("opponent_actor_button@battle.battle_actor_button", {
    controls: [
      {
        details_overlay: {
          type: "stack_panel",
          orientation: "horizontal",
          size: ["100%", "100%"],
          controls: [
            { "entity_icon_overlay@battle.battle_actor_entity_icon_overlay": {} },
            { "actor_description@battle.battle_actor_description": {} },
          ],
        },
      },
    ],
  });

  // Actor button check ID templates
  ns.addRaw("ally_actor_details_button_check_id@battle.ally_actor_button", {
    "$button_id|default": "b:opponent_1_",
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
        source_property_name: contains("#form_button_text", "$button_id"),
        target_property_name: "#visible",
      },
    ],
  });

  ns.addRaw("opponent_actor_details_button_check_id@battle.opponent_actor_button", {
    "$button_id|default": "b:opponent_1_",
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
        source_property_name: contains("#form_button_text", "$button_id"),
        target_property_name: "#visible",
      },
    ],
  });

  // Opponent actor details button (up to 4 opponents)
  ns.addRaw("opponent_actor_details_button", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["100%", "100%c"],
    offset: ["-50%", "10%"],
    controls: [
      { "1@battle.opponent_actor_details_button_check_id": { $button_id: "§0§0§1" } },
      { "2@battle.opponent_actor_details_button_check_id": { $button_id: "§0§0§2" } },
      { "3@battle.opponent_actor_details_button_check_id": { $button_id: "§0§0§3" } },
      { "4@battle.opponent_actor_details_button_check_id": { $button_id: "§0§0§4" } },
    ],
  });

  // Ally actor details button (up to 4 allies)
  ns.addRaw("ally_actor_details_button", {
    type: "stack_panel",
    orientation: "vertical",
    size: ["100%", "100%c"],
    offset: ["50%", "10%"],
    controls: [
      { "1@battle.ally_actor_details_button_check_id": { $button_id: "§0§a§1" } },
      { "2@battle.ally_actor_details_button_check_id": { $button_id: "§0§a§2" } },
      { "3@battle.ally_actor_details_button_check_id": { $button_id: "§0§a§3" } },
      { "4@battle.ally_actor_details_button_check_id": { $button_id: "§0§a§4" } },
    ],
  });

  // Main battle UI
  ns.add(
    panel("main")
      .fullSize()
      .controls(
        // Battle menu at bottom
        {
          battle_menu: {
            type: "image",
            texture: "textures/ui/battle/white_transparency",
            color: [0.749, 0.168, 0.211],
            layer: 1,
            keep_ratio: true,
            fill: true,
            anchor_from: "bottom_left",
            anchor_to: "bottom_left",
            size: ["100%", "29%"],
            controls: [
              {
                main_buttons_holder: {
                  type: "stack_panel",
                  size: ["100%", "95%"],
                  orientation: "horizontal",
                  anchor_from: "bottom_left",
                  anchor_to: "bottom_left",
                  controls: [
                    {
                      menu_extra: {
                        type: "image",
                        texture: "textures/ui/battle/white_transparency",
                        color: [0.137, 0.125, 0.125],
                        layer: 2,
                        keep_ratio: true,
                        fill: true,
                        anchor_from: "bottom_left",
                        anchor_to: "bottom_left",
                        size: ["85%", "100%"],
                        controls: [
                          {
                            "left_button_panel@battle.button_stack": {
                              size: ["100%", "100%"],
                              layer: 3,
                              $button: "battle.battle_action_button",
                            },
                          },
                          {
                            "move_selection_button@battle.button_stack": {
                              size: ["100%", "100%"],
                              layer: 3,
                              offset: ["55%", "20%"],
                              anchor_from: "center",
                              anchor_to: "center",
                              $button: "battle.move_selection_button",
                            },
                          },
                          {
                            button_grid_middle: {
                              type: "image",
                              texture: "textures/ui/battle/white_transparency",
                              color: ["black"],
                              alpha: 0,
                              layer: 1,
                              keep_ratio: true,
                              fill: true,
                              anchor_from: "center",
                              anchor_to: "center",
                              size: ["80%", "95%"],
                              offset: ["9%", 0],
                              controls: [
                                {
                                  "grid_panel@battle.button_stack": {
                                    size: ["100%", "100%"],
                                    layer: 4,
                                    $button: "battle.grid_button",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    {
                      info_label: {
                        type: "label",
                        localize: false,
                        text: "#form_text",
                        color: "default",
                        alpha: 1,
                        text_alignment: "center",
                        font_scale_factor: 1,
                        anchor_from: "center",
                        anchor_to: "center",
                        size: ["fill", "100%"],
                        layer: 3,
                        shadow: false,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Actor details at top
        {
          actors_details_selection: {
            type: "stack_panel",
            orientation: "horizontal",
            size: ["100%", "71%"],
            offset: ["0%", "25%"],
            anchor_from: "top_middle",
            anchor_to: "top_middle",
            controls: [
              {
                "opponent_actors@battle.button_stack": {
                  size: ["25%", "100%"],
                  layer: 21,
                  $button: "battle.opponent_actor_details_button",
                },
              },
              { spacing: { type: "panel", size: ["50%", "100%"] } },
              {
                "ally_actors@battle.button_stack": {
                  size: ["25%", "100%"],
                  layer: 21,
                  $button: "battle.ally_actor_details_button",
                },
              },
            ],
          },
        }
      )
  );
});

