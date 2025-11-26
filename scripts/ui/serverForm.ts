/**
 * Server Form UI
 *
 * Main server form screen that routes to different UI screens based on title flags.
 */

import { defineUI, panel, stackPanel, image, label, contains } from "mcbe-ts-ui";

// UI type flags
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

// Helper to create visibility bindings for a flag
const flagBindings = (flag: string) => [
  { binding_type: "global", binding_condition: "none", binding_name: "#title_text", binding_name_override: "#title_text" },
  { binding_name: "#null", source_property_name: contains("#title_text", flag), binding_type: "view", target_property_name: "#visible" },
  { binding_name: "#null", source_property_name: contains("#title_text", flag), binding_type: "view", target_property_name: "#enabled" },
];

export default defineUI("server_form", (ns) => {
  // Long form base
  ns.addRaw("long_form@common_dialogs.main_panel_no_buttons", { size: [260, 210] });

  // Custom form base
  ns.addRaw("custom_form@common_dialogs.main_panel_no_buttons", { size: [260, 210] });

  // Third party server screen
  ns.addRaw("third_party_server_screen@common.base_screen", {
    $screen_content: "server_form.ng_main_screen_content",
    button_mappings: [{ from_button_id: "button.menu_cancel", to_button_id: "button.menu_exit", mapping_type: "global" }],
  });

  // Main screen content with factory
  ns.add(
    panel("ng_main_screen_content")
      .fullSize()
      .controls({
        server_form_factory: {
          type: "factory",
          control_ids: {
            long_form: "@server_form.ng_long_form",
            custom_form: "@server_form.custom_form",
          },
        },
      })
  );

  // Long form with all UI variants
  ns.add(
    panel("ng_long_form")
      .fullSize()
      .rawProp("$flag_pokemon", FLAGS.pokemon)
      .rawProp("$flag_pokedex", FLAGS.pokedex)
      .rawProp("$flag_pokedex_details", FLAGS.pokedexDetails)
      .rawProp("$flag_battle", FLAGS.battle)
      .rawProp("$flag_chestGui", FLAGS.chestGui)
      .rawProp("$flag_searchUi", FLAGS.searchUi)
      .rawProp("$flag_rotom_phone_first", FLAGS.rotomPhoneFirst)
      .rawProp("$flag_rotom_phone_second", FLAGS.rotomPhoneSecond)
      .rawProp("$flag_rotom_phone_third", FLAGS.rotomPhoneThird)
      .rawProp("$flag_pc", FLAGS.pc)
      .controls(
        // Default long form
        {
          "long_form@long_form": {
            enabled: false,
            visible: false,
            bindings: [
              { binding_type: "global", binding_condition: "none", binding_name: "#title_text", binding_name_override: "#title_text" },
              {
                binding_name: "#null",
                source_property_name:
                  "(((#title_text - $flag_pokemon - $flag_pokedex - $flag_pokedex_details - $flag_pc - $flag_battle - $flag_chestGui - $flag_searchUi - $flag_rotom_phone_first - $flag_rotom_phone_second - $flag_rotom_phone_third ) = #title_text) )",
                binding_type: "view",
                target_property_name: "#visible",
              },
              {
                binding_name: "#null",
                source_property_name:
                  "(((#title_text - $flag_pokemon - $flag_pokedex - $flag_pokedex_details - $flag_pc - $flag_battle - $flag_chestGui - $flag_searchUi - $flag_rotom_phone_first - $flag_rotom_phone_second - $flag_rotom_phone_third ) = #title_text) )",
                binding_type: "view",
                target_property_name: "#enabled",
              },
            ],
          },
        },
        { "pokemon_battle@battle.main": { enabled: false, visible: false, bindings: flagBindings(FLAGS.battle) } },
        { "pokemon@pokemon.main_panel": { enabled: false, visible: false, bindings: flagBindings(FLAGS.pokemon) } },
        { "pokedex@pokedex.main_grid": { enabled: false, visible: false, bindings: flagBindings(FLAGS.pokedex) } },
        { "pc@pc.main": { enabled: false, visible: false, bindings: flagBindings(FLAGS.pc) } },
        { "pokedex_details@pokedex.pokemon_details": { enabled: false, visible: false, bindings: flagBindings(FLAGS.pokedexDetails) } },
        { "chest_ui@chest_ui.chest_panel": { enabled: false, visible: false, bindings: flagBindings(FLAGS.chestGui) } },
        { "search_ui@search_server_form.long_form": { enabled: false, visible: false, bindings: flagBindings(FLAGS.searchUi) } },
        { "rotom_phone_first@rotom_phone_first.blackbarbar_first": { enabled: false, visible: false, bindings: flagBindings(FLAGS.rotomPhoneFirst) } },
        {
          "rotom_phone_second@rotom_phone_second.blackbarbar_second": {
            enabled: false,
            visible: false,
            bindings: [
              { binding_type: "global", binding_condition: "none", binding_name: "#title_text", binding_name_override: "#title_text" },
              { binding_name: "#null", source_property_name: contains("#title_text", FLAGS.rotomPhoneSecond), binding_type: "view", target_property_name: "#visible" },
              { binding_name: "#null", source_property_name: contains("#title_text", FLAGS.rotomPhoneFirst), binding_type: "view", target_property_name: "#enabled" },
            ],
          },
        },
        {
          "rotom_phone_third@rotom_phone_third.blackbarbar_third": {
            enabled: false,
            visible: false,
            bindings: [
              { binding_type: "global", binding_condition: "none", binding_name: "#title_text", binding_name_override: "#title_text" },
              { binding_name: "#null", source_property_name: contains("#title_text", FLAGS.rotomPhoneThird), binding_type: "view", target_property_name: "#visible" },
              { binding_name: "#null", source_property_name: contains("#title_text", FLAGS.rotomPhoneFirst), binding_type: "view", target_property_name: "#enabled" },
            ],
          },
        }
      )
  );

  // Dynamic button with image support
  ns.add(
    stackPanel("dynamic_button")
      .size("100%", 32)
      .horizontal()
      .controls(
        {
          panel_name: {
            type: "panel",
            size: [34, "100%c"],
            bindings: [
              { binding_name: "#null", binding_type: "view", source_control_name: "image", resolve_sibling_scope: true, source_property_name: "(not (#texture = ''))", target_property_name: "#visible" },
            ],
            controls: [
              {
                image: {
                  type: "image",
                  layer: 2,
                  size: [32, 32],
                  offset: [-2, 0],
                  bindings: [
                    { binding_name: "#form_button_texture", binding_name_override: "#texture", binding_type: "collection", binding_collection_name: "form_buttons" },
                    { binding_name: "#form_button_texture_file_system", binding_name_override: "#texture_file_system", binding_type: "collection", binding_collection_name: "form_buttons" },
                    { binding_name: "#null", binding_type: "view", source_property_name: "(not ((#texture = '') or (#texture = 'loading')))", target_property_name: "#visible" },
                  ],
                },
              },
              {
                "progress@progress.progress_loading_bars": {
                  size: [30, 4],
                  offset: [-2, 16],
                  bindings: [
                    { binding_name: "#null", binding_type: "view", source_control_name: "image", resolve_sibling_scope: true, source_property_name: "(#texture = 'loading')", target_property_name: "#visible" },
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
              { binding_name: "#null", binding_type: "collection_details", binding_collection_name: "form_buttons" },
              { binding_type: "collection", binding_collection_name: "form_buttons", binding_condition: "none", binding_name: "#form_button_text", binding_name_override: "#form_button_text" },
              { binding_name: "#null", binding_type: "view", source_property_name: "(not((%.1s * #form_button_text) = ' '))", target_property_name: "#enabled" },
            ],
          },
        }
      )
  );
});
