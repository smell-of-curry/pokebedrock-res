/**
 * HUD Screen Modifications
 *
 * Modifies the vanilla HUD to add custom Pokemon HUD elements
 * and adjust default HUD positioning.
 */

import { redefineUI, panel } from "mcbe-ts-ui";

export default redefineUI("hud_screen", (ns) => {
  // Modify hud title text positioning
  ns.addRaw("hud_title_text", {
    size: ["100%", "100%"],
    offset: [0, 0],
    alpha: 1,
  })
    .addRaw("hud_title_text/title_frame", {
      size: ["100%", "50%"],
    })
    .addRaw("hud_title_text/title_frame/title_background", {
      anchor_from: "bottom_middle",
      anchor_to: "bottom_middle",
      bindings: [
        {
          binding_type: "global",
          binding_condition: "none",
          binding_name: "#hud_title_text_string",
          binding_name_override: "#hud_title_text_string",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name:
            "(not ((%.1s * #hud_title_text_string ) = '&_'))",
          target_property_name: "#visible",
        },
      ],
    })
    .addRaw("hud_title_text/title_frame/title", {
      anchor_from: "bottom_middle",
      anchor_to: "bottom_middle",
      font_scale_factor: 0.5,
      bindings: [
        {
          binding_type: "global",
          binding_condition: "none",
          binding_name: "#hud_title_text_string",
          binding_name_override: "#hud_title_text_string",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name:
            "(not ((%.1s * #hud_title_text_string ) = '&_'))",
          target_property_name: "#visible",
        },
      ],
    })
    .addRaw("hud_title_text/subtitle_frame/subtitle", {
      visible: false,
    });

  // Add PHUD to root panel
  ns.addRaw("root_panel", {
    modifications: [
      {
        array_name: "controls",
        operation: "insert_back",
        value: [{ "phud@phud.main": {} }],
      },
    ],
  });

  // Add player ping after player_position in chat stack
  ns.addRaw("root_panel/chat_stack", {
    modifications: [
      {
        control_name: "player_position",
        operation: "insert_after",
        value: [{ "player_ping@player_ping.main": {} }],
      },
    ],
  });

  // Custom HUD elements at bottom middle

  panel("centered_gui_elements_at_bottom_middle")
    .anchor("bottom_middle")
    .size(180, 50)
    .controls(
      {
        "heart_rend@heart_renderer": {
          offset: [-1, -40],
          anchor_from: "bottom_left",
          anchor_to: "bottom_left",
        },
      },
      {
        "armor_rend@armor_renderer": {
          offset: [-1, -40],
          anchor_from: "bottom_left",
          anchor_to: "bottom_left",
        },
      },
      {
        "hunger_rend@hunger_renderer": {
          offset: [180, -40],
          anchor_from: "bottom_left",
          anchor_to: "bottom_left",
        },
      },
      {
        "bubbles_rend_0@bubbles_renderer": {
          offset: [180, -50],
          anchor_from: "bottom_left",
          anchor_to: "bottom_left",
          bindings: [
            {
              binding_name: "#is_not_riding",
              binding_name_override: "#visible",
            },
          ],
        },
      },
      {
        "bubbles_rend_1@bubbles_renderer": {
          offset: [180, -70],
          anchor_from: "bottom_left",
          anchor_to: "bottom_left",
          bindings: [
            {
              binding_name: "#is_riding",
              binding_name_override: "#visible",
            },
          ],
        },
      },
      { "exp_rend@exp_progress_bar_and_hotbar": {} }
    )
    .bindings({
      binding_name: "#hud_visible_centered",
      binding_name_override: "#visible",
      binding_type: "global",
    })
    .addToNamespace(ns);

  // TODO: on conversion, make this proper mapped.
  return ns;
});
