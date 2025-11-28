/**
 * Server Form UI
 *
 * Main server form screen that routes to different UI screens based on title flags.
 */

import {
  panel,
  contains,
  factory,
  PanelBuilder,
  Binding,
  notContain,
  redefineUI,
  screen,
  extendExternal,
} from "mcbe-ts-ui";

import PokemonForm from "./pokemon/pokemon";
import PokedexForm from "./pokemon/pokedex";
import BattleForm from "./pokemon/attackScreen";
import ChestForm from "./chestServerForm";
import RotomPhoneFirst from "./rotomPhone/first";
import RotomPhoneSecond from "./rotomPhone/second";
import RotomPhoneThird from "./rotomPhone/third";
import PcForm from "./pokemon/pc";

const CUSTOM_FORMS = [
  {
    name: "pokemon",
    flag: "§p§o§k§e",
    namespace: PokemonForm,
  },
  {
    name: "pokedex",
    flag: "§d§e§k§x",
    namespace: PokedexForm,
  },
  {
    name: "battle",
    flag: "§b§a§t§l§e",
    namespace: BattleForm,
  },
  {
    name: "chestGui",
    flag: "§c§h§e§s§t",
    namespace: ChestForm,
  },
  // Note: SearchForm is NOT imported here - it's a separate screen that extends serverForm,
  // not a custom form routed by serverForm. Importing it would create a circular dependency.
  // {
  //   name: "searchUi",
  //   flag: "§s§e§a§r§c",
  //   namespace: SearchForm,
  // },
  {
    name: "rotom_phone_first",
    flag: "§1§r",
    namespace: RotomPhoneFirst,
  },
  {
    name: "rotom_phone_second",
    flag: "§2§r",
    namespace: RotomPhoneSecond,
  },
  {
    name: "rotom_phone_third",
    flag: "§3§r",
    namespace: RotomPhoneThird,
  },
  {
    name: "pc",
    flag: "§p§c",
    namespace: PcForm,
  },
] as const;

// Helper to create visibility bindings for a flag
const flagBindings = (flag: string, flip: boolean = false): Binding[] => [
  {
    binding_type: "global",
    binding_condition: "none",
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view",
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view",
    target_property_name: "#enabled",
  },
];

export default redefineUI("server_form", (ns) => {
  const [longForm, ns1] = ns.add(
    panel("long_form")
      .extends("common_dialogs.main_panel_no_buttons")
      .size(260, 210)
  );

  const [customForm, ns2] = ns1.add(
    panel("custom_form")
      .extends("common_dialogs.main_panel_no_buttons")
      .size(260, 210)
  );

  const longFormControl = panel("long_form_control")
    .extendsFrom(longForm)
    .enabled(false)
    .visible(false)
    .bindings(
      ...flagBindings(CUSTOM_FORMS.map((f) => `'${f.flag}'`).join(" - "), true)
    );

  const longFormContent = panel("ng_long_form");
  const flagControls: PanelBuilder<string>[] = [];
  for (const form of CUSTOM_FORMS) {
    flagControls.push(
      extendExternal(`${form.name}_form`, form.namespace.elements["main"]!)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(form.flag))
    );
  }
  longFormContent.controls(longFormControl, ...flagControls).addToNamespace(ns);

  const serverFormFactory = factory("server_form_factory").controlIds({
    long_form: "@server_form." + longFormContent.getName(),
    custom_form: "@server_form." + customForm.getName(),
  });

  const [screenContent, ns3] = ns2.add(
    panel("ng_main_screen_content").controls(serverFormFactory)
  );

  // This is what enables everything
  const [, finalNs] = ns3.add(
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
