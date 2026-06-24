/**
 * Server Form UI
 *
 * Main server form screen that routes to different UI screens based on title flags.
 */

import {
  panel,
  contains,
  factory,
  notContain,
  redefineUI,
  screen,
  extendExternal,
  extendRaw,
  extend,
} from "mcbe-ts-ui";

import PokemonForm from "./pokemon/pokemon";
import PokedexForm from "./pokemon/pokedex";
import BattleForm from "./pokemon/attackScreen";
import ChestForm from "./chestServerForm";
import RotomPhoneFirst from "./rotomPhone/first";
import RotomPhoneSecond from "./rotomPhone/second";
import RotomPhoneThird from "./rotomPhone/third";
import PcForm from "./pokemon/pc";

const POKEMON_FLAGS = ["§p§o§k§e§1", "§p§o§k§e§s"] as const;

const FLAGS = {
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

const ALL_FLAGS_EXPR = [
  ...POKEMON_FLAGS.map((flag) => `'${flag}'`),
  ...Object.values(FLAGS).map((flag) => `'${flag}'`),
].join(" - ");

const pokemonFlagBindings = () => [
  {
    binding_type: "global" as const,
    binding_condition: "none" as const,
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: POKEMON_FLAGS.map(
      (flag) => `(not ((#title_text - '${flag}') = #title_text))`
    ).join(" or "),
    binding_type: "view" as const,
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: POKEMON_FLAGS.map(
      (flag) => `(not ((#title_text - '${flag}') = #title_text))`
    ).join(" or "),
    binding_type: "view" as const,
    target_property_name: "#enabled",
  },
];

const flagBindings = (flag: string, flip = false) => [
  {
    binding_type: "global" as const,
    binding_condition: "none" as const,
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view" as const,
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view" as const,
    target_property_name: "#enabled",
  },
];

export default redefineUI("server_form", (ns) => {
  const [, ns1] = ns.add(
    panel("long_form").extends("common_dialogs.main_panel_no_buttons").size(260, 210)
  );

  const [, ns2] = ns1.add(
    panel("custom_form")
      .extends("common_dialogs.main_panel_no_buttons")
      .size(260, 210)
  );

  const longFormPanel = panel("ng_long_form")
    .fullSize()
    .variable("flag_pokedex", FLAGS.pokedex)
    .variable("flag_pokedex_details", FLAGS.pokedexDetails)
    .variable("flag_battle", FLAGS.battle)
    .variable("flag_chestGui", FLAGS.chestGui)
    .variable("flag_searchUi", FLAGS.searchUi)
    .variable("flag_rotom_phone_first", FLAGS.rotomPhoneFirst)
    .variable("flag_rotom_phone_second", FLAGS.rotomPhoneSecond)
    .variable("flag_rotom_phone_third", FLAGS.rotomPhoneThird)
    .variable("flag_pc", FLAGS.pc)
    .controls(
      extend("long_form", ns1.elements["long_form"]!)
        .enabled(false)
        .visible(false)
        .bindings({
          binding_type: "global",
          binding_condition: "none",
          binding_name: "#title_text",
          binding_name_override: "#title_text",
        })
        .bindings({
          binding_name: "#null",
          source_property_name: `((#title_text - ${ALL_FLAGS_EXPR}) = #title_text)`,
          binding_type: "view",
          target_property_name: "#visible",
        })
        .bindings({
          binding_name: "#null",
          source_property_name: `((#title_text - ${ALL_FLAGS_EXPR}) = #title_text)`,
          binding_type: "view",
          target_property_name: "#enabled",
        }),
      extendExternal("pokemon_battle", BattleForm.elements["main"]!)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.battle)),
      extendExternal("pokemon", PokemonForm.elements["main_panel"]!)
        .enabled(false)
        .visible(false)
        .bindings(...pokemonFlagBindings()),
      extendExternal("pokedex", PokedexForm.elements["main_grid"]!)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.pokedex)),
      extendExternal("pc", PcForm.elements["main"]!)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.pc)),
      panel("pokedex_details")
        .extends("pokedex.pokemon_details")
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.pokedexDetails)),
      extendExternal("chest_ui", ChestForm.elements["chest_panel"]!)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.chestGui)),
      panel("search_ui")
        .extends("search_server_form.long_form")
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.searchUi)),
      extendExternal(
        "rotom_phone_first",
        RotomPhoneFirst.elements["blackbarbar_first"]!
      )
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneFirst)),
      extendExternal(
        "rotom_phone_second",
        RotomPhoneSecond.elements["blackbarbar_second"]!
      )
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneSecond)),
      extendExternal(
        "rotom_phone_third",
        RotomPhoneThird.elements["blackbarbar_third"]!
      )
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneThird))
    );

  const [, ns3] = ns2.add(longFormPanel);

  ns3.addRaw("dynamic_button", {
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
      extendRaw("form_button", "common_buttons.light_text_button", {
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
      }),
    ],
  });

  const serverFormFactory = factory("server_form_factory").controlIds({
    long_form: "@server_form.ng_long_form",
    custom_form: "@server_form.custom_form",
  });

  const [screenContent, ns4] = ns3.add(
    panel("ng_main_screen_content").fullSize().controls(serverFormFactory)
  );

  const [, finalNs] = ns4.add(
    screen("third_party_server_screen")
      .extends("common.base_screen")
      .variable("screen_content", "server_form." + screenContent.getName())
      .buttonMappings({
        from_button_id: "button.menu_cancel",
        to_button_id: "button.menu_exit",
        mapping_type: "global",
      })
  );
  return finalNs;
});
