/**
 * PHUD - Pokemon HUD Main File
 *
 * Central HUD controller that manages data parsing and element rendering.
 * Uses title text bindings to receive data from the server and distributes
 * parsed values to child elements.
 */

import { defineUI, panel } from "mcbe-ts-ui";

// Update string prefixes for each HUD component
const UPDATE_STRINGS = {
  currency: "&_currency:",
  phone: "&_phone:",
  battleWait: "&_battleWait:",
  loadingScreen: "&_loadingScreen:",
  evolutionWait: "&_evolutionWait:",
  sidebar: "&_sidebar:",
  actionbar: "&_actionbar:",
  playerPing: "&_playerPing:",
} as const;

// Data control template - parses title text updates
const dataControl = panel("data_control").size(0, 0).bindings(
  { binding_name: "#hud_title_text_string" },
  {
    binding_name: "#hud_title_text_string",
    binding_name_override: "#preserved_text",
    binding_condition: "visibility_changed",
  },
  {
    binding_name: "#null",
    binding_type: "view",
    source_property_name:
      "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
    target_property_name: "#visible",
  }
);

// Renderers panel - contains all data control instances
const renderers = panel("renderers").controls(
  {
    "currency_data_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.currency,
    },
  },
  {
    "phone_data_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.phone,
    },
  },
  {
    "battle_wait_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.battleWait,
    },
  },
  {
    "loading_screen_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.loadingScreen,
    },
  },
  {
    "evolution_wait_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.evolutionWait,
    },
  },
  {
    "sidebar_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.sidebar,
    },
  },
  {
    "actionbar_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.actionbar,
    },
  },
  {
    "player_ping_control@phud.data_control": {
      $update_string: UPDATE_STRINGS.playerPing,
    },
  }
);

// Elements panel - contains all visible HUD elements with parsed data
const elements = panel("elements")
  .variable("offset", [0, 0])
  .rawProp("offset", "$offset")
  .rawProp("variables", [{ requires: "$pocket_screen", $offset: [0, 10] }])
  .bindings(
    // Phone data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "phone_data_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.phone}')`,
      target_property_name: "#phone",
      resolve_sibling_scope: true,
    },
    // Currency data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "currency_data_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.currency}')`,
      target_property_name: "#level_number",
      resolve_sibling_scope: true,
    },
    // Battle wait data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "battle_wait_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.battleWait}')`,
      target_property_name: "#battleLog",
      resolve_sibling_scope: true,
    },
    // Loading screen data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "loading_screen_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.loadingScreen}')`,
      target_property_name: "#loadingScreen",
      resolve_sibling_scope: true,
    },
    // Evolution wait data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "evolution_wait_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.evolutionWait}')`,
      target_property_name: "#evolutionWait",
      resolve_sibling_scope: true,
    },
    // Sidebar data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "sidebar_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.sidebar}')`,
      target_property_name: "#sidebar",
      resolve_sibling_scope: true,
    },
    // Actionbar data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "actionbar_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.actionbar}')`,
      target_property_name: "#fake_actionbar",
      resolve_sibling_scope: true,
    },
    // Player ping data binding
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "player_ping_control",
      source_property_name: `(#preserved_text - '${UPDATE_STRINGS.playerPing}')`,
      target_property_name: "#player_ping_text",
      resolve_sibling_scope: true,
    }
  )
  .controls(
    // Currency display
    {
      "currency@phud_currency.main": {
        anchor_from: "top_middle",
        anchor_to: "top_middle",
        offset: [0, 8],
        $font_scale: 1,
        $color: [1, 1, 0.52, 1],
      },
    },
    // Phone display
    {
      "phone@phud_phone.main": {
        size: [64, 64],
        offset: [8, 0],
        anchor_from: "left_middle",
        anchor_to: "left_middle",
      },
    },
    // Battle wait display
    { "battle_wait@phud_battleWait.main": {} },
    // Loading screen display
    { "loadingScreen@phud_loadingScreen.main": {} },
    // Evolution wait display
    { "evolutionWait@phud_evolutionWait.main": {} },
    // Sidebar display
    { "sidebar@phud_sidebar.main": { $color: "white" } },
    // Actionbar display
    {
      "actionbar@phud_actionbar.main": {
        anchor_from: "top_middle",
        anchor_to: "top_middle",
        offset: [0, "50% - 70px"],
        $font_scale: 1,
        $color: [1, 1, 0.52, 1],
      },
    }
  );

export default defineUI(
  "phud",
  (ns) => {
    ns.addAll(
      dataControl,
      renderers,
      elements,
      panel("main").fullSize().controls(renderers, elements)
    );
  },
  { subdir: "phud" }
);
