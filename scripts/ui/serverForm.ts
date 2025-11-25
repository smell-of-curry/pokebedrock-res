/**
 * Server Form UI
 *
 * Main server form screen that routes to different UI screens based on title flags.
 * Supports multiple custom UIs: Pokemon, Pokedex, Battle, Chest, Search, Rotom Phone, PC.
 */

import { defineUI, panel, stackPanel, image, label } from "mcbe-ts-ui";
import { contains, not } from "./phud/_string_parser";

// UI type flags - used to determine which UI to show
const FLAGS = {
  pokemon: "§p§o§k§e",
  pokedex: "§d§e§k§x",
  pokedexDetails: "§d§e§d§e§t§k",
  battle: "§b§a§t§l§e",
  chestGui: "§c§h§e§s§t",
  searchUi: "§s§e§a§r§c",
  rotomPhoneFirst: "§1§r",
  rotomPhoneSecond: "§2§r",
  rotomPhoneThird: "§3§r",
  pc: "§p§c",
} as const;

// All flags combined for default form visibility check
const ALL_FLAGS = Object.values(FLAGS).join(" - ");

export default defineUI("server_form", (ns) => {
  // Long form base (extends common dialogs)
  ns.addRaw("long_form@common_dialogs.main_panel_no_buttons", {
    size: [260, 210],
  });

  // Custom form base
  ns.addRaw("custom_form@common_dialogs.main_panel_no_buttons", {
    size: [260, 210],
  });

  // Third party server screen
  ns.addRaw("third_party_server_screen@common.base_screen", {
    $screen_content: "server_form.ng_main_screen_content",
    button_mappings: [
      {
        from_button_id: "button.menu_cancel",
        to_button_id: "button.menu_exit",
        mapping_type: "global",
      },
    ],
  });

  // Main screen content with factory
  ns.addRaw("ng_main_screen_content", {
    type: "panel",
    size: ["100%", "100%"],
    controls: [
      {
        server_form_factory: {
          type: "factory",
          control_ids: {
            long_form: "@server_form.ng_long_form",
            custom_form: "@server_form.custom_form",
          },
        },
      },
    ],
  });

  // Helper to create visibility bindings for a flag
  const flagBindings = (flag: string, useContains = true) => {
    const visibilityExpr = useContains
      ? contains("#title_text", flag)
      : `(((#title_text - ${ALL_FLAGS.replace(
          new RegExp(flag.replace(/[§]/g, "\\§"), "g"),
          ""
        )}) = #title_text))`;

    return [
      {
        binding_type: "global",
        binding_condition: "none",
        binding_name: "#title_text",
        binding_name_override: "#title_text",
      },
      {
        binding_name: "#null",
        source_property_name: visibilityExpr,
        binding_type: "view",
        target_property_name: "#visible",
      },
      {
        binding_name: "#null",
        source_property_name: visibilityExpr,
        binding_type: "view",
        target_property_name: "#enabled",
      },
    ];
  };

  // Long form with all UI variants
  ns.addRaw("ng_long_form", {
    type: "panel",
    $flag_pokemon: FLAGS.pokemon,
    $flag_pokedex: FLAGS.pokedex,
    $flag_pokedex_details: FLAGS.pokedexDetails,
    $flag_battle: FLAGS.battle,
    $flag_chestGui: FLAGS.chestGui,
    $flag_searchUi: FLAGS.searchUi,
    $flag_rotom_phone_first: FLAGS.rotomPhoneFirst,
    $flag_rotom_phone_second: FLAGS.rotomPhoneSecond,
    $flag_rotom_phone_third: FLAGS.rotomPhoneThird,
    $flag_pc: FLAGS.pc,
    size: ["100%", "100%"],
    controls: [
      // Default long form (visible when no flags match)
      {
        "long_form@long_form": {
          enabled: false,
          visible: false,
          bindings: [
            {
              binding_type: "global",
              binding_condition: "none",
              binding_name: "#title_text",
              binding_name_override: "#title_text",
            },
            {
              binding_name: "#null",
              source_property_name: `(((#title_text - $flag_pokemon - $flag_pokedex - $flag_pokedex_details - $flag_pc - $flag_battle - $flag_chestGui - $flag_searchUi - $flag_rotom_phone_first - $flag_rotom_phone_second - $flag_rotom_phone_third ) = #title_text) )`,
              binding_type: "view",
              target_property_name: "#visible",
            },
            {
              binding_name: "#null",
              source_property_name: `(((#title_text - $flag_pokemon - $flag_pokedex - $flag_pokedex_details - $flag_pc - $flag_battle - $flag_chestGui - $flag_searchUi - $flag_rotom_phone_first - $flag_rotom_phone_second - $flag_rotom_phone_third ) = #title_text) )`,
              binding_type: "view",
              target_property_name: "#enabled",
            },
          ],
        },
      },
      // Pokemon battle UI
      {
        "pokemon_battle@battle.main": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.battle),
        },
      },
      // Pokemon UI (starter selection)
      {
        "pokemon@pokemon.main_panel": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.pokemon),
        },
      },
      // Pokedex UI
      {
        "pokedex@pokedex.main_grid": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.pokedex),
        },
      },
      // PC UI
      {
        "pc@pc.main": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.pc),
        },
      },
      // Pokedex details UI
      {
        "pokedex_details@pokedex.pokemon_details": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.pokedexDetails),
        },
      },
      // Chest UI
      {
        "chest_ui@chest_ui.chest_panel": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.chestGui),
        },
      },
      // Search UI
      {
        "search_ui@search_server_form.long_form": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.searchUi),
        },
      },
      // Rotom phone first page
      {
        "rotom_phone_first@rotom_phone_first.blackbarbar_first": {
          enabled: false,
          visible: false,
          bindings: flagBindings(FLAGS.rotomPhoneFirst),
        },
      },
      // Rotom phone second page
      {
        "rotom_phone_second@rotom_phone_second.blackbarbar_second": {
          enabled: false,
          visible: false,
          bindings: [
            {
              binding_type: "global",
              binding_condition: "none",
              binding_name: "#title_text",
              binding_name_override: "#title_text",
            },
            {
              binding_name: "#null",
              source_property_name: contains("#title_text", FLAGS.rotomPhoneSecond),
              binding_type: "view",
              target_property_name: "#visible",
            },
            {
              binding_name: "#null",
              source_property_name: contains("#title_text", FLAGS.rotomPhoneFirst),
              binding_type: "view",
              target_property_name: "#enabled",
            },
          ],
        },
      },
      // Rotom phone third page
      {
        "rotom_phone_third@rotom_phone_third.blackbarbar_third": {
          enabled: false,
          visible: false,
          bindings: [
            {
              binding_type: "global",
              binding_condition: "none",
              binding_name: "#title_text",
              binding_name_override: "#title_text",
            },
            {
              binding_name: "#null",
              source_property_name: contains("#title_text", FLAGS.rotomPhoneThird),
              binding_type: "view",
              target_property_name: "#visible",
            },
            {
              binding_name: "#null",
              source_property_name: contains("#title_text", FLAGS.rotomPhoneFirst),
              binding_type: "view",
              target_property_name: "#enabled",
            },
          ],
        },
      },
    ],
  });

  // Dynamic button with image support
  ns.addRaw("dynamic_button", {
    type: "stack_panel",
    size: ["100%", 32],
    orientation: "horizontal",
    controls: [
      {
        panel_name: {
          type: "panel",
          size: [34, "100%c"],
          bindings: [
            {
              binding_name: "#null",
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
                layer: 2,
                size: [32, 32],
                offset: [-2, 0],
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
            {
              "progress@progress.progress_loading_bars": {
                size: [30, 4],
                offset: [-2, 16],
                bindings: [
                  {
                    binding_name: "#null",
                    binding_type: "view",
                    source_control_name: "image",
                    resolve_sibling_scope: true,
                    source_property_name: "(#texture = 'loading')",
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
          anchor_from: "top_left",
          anchor_to: "top_left",
          size: ["fill", 32],
          $button_text: "#form_button_text",
          $button_text_binding_type: "collection",
          $button_text_grid_collection_name: "form_buttons",
          $button_text_max_size: ["100%", 20],
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
              source_property_name: "(not((%.1s * #form_button_text) = ' '))",
              target_property_name: "#enabled",
            },
          ],
        },
      },
    ],
  });
});

