import {
  Binding,
  ControlReference,
  defineUI,
  hudTitleBinding,
  panel,
  preservedTextBinding,
  ref,
  siblingViewBinding,
  strip,
  viewBinding,
} from "mcbe-ts-ui";

// HUD component configuration
interface HudComponent {
  updateString: string;
  controlName: string;
  bindingTarget: string;
  refName?: string;
  namespace?: string;
  overrides?: Record<string, unknown>;
}

// All HUD components defined in one place
const HUD_COMPONENTS: HudComponent[] = [
  {
    updateString: "&_currency:",
    controlName: "currency_data_control",
    bindingTarget: "#level_number",
    namespace: "phud_currency",
  },
  {
    updateString: "&_phone:",
    controlName: "phone_data_control",
    bindingTarget: "#phone",
    namespace: "phud_phone",
  },
  {
    updateString: "&_battleWait:",
    controlName: "battle_wait_control",
    bindingTarget: "#battleLog",
    refName: "battle_wait",
    namespace: "phud_battleWait",
  },
  {
    updateString: "&_loadingScreen:",
    controlName: "loading_screen_control",
    bindingTarget: "#loadingScreen",
    namespace: "phud_loadingScreen",
  },
  {
    updateString: "&_evolutionWait:",
    controlName: "evolution_wait_control",
    bindingTarget: "#evolutionWait",
    namespace: "phud_evolutionWait",
  },
  {
    updateString: "&_sidebar:",
    controlName: "sidebar_control",
    bindingTarget: "#sidebar",
    namespace: "phud_sidebar",
    overrides: { $color: "white" },
  },
  {
    updateString: "&_actionbar:",
    controlName: "actionbar_control",
    bindingTarget: "#fake_actionbar",
    namespace: "phud_actionbar",
  },
  {
    updateString: "&_playerPing:",
    controlName: "player_ping_control",
    bindingTarget: "#player_ping_text",
  },
];

// Generate data control refs for renderers
const dataControlRefs = (): ControlReference[] =>
  HUD_COMPONENTS.map(({ controlName, updateString }) =>
    ref(`${controlName}@phud.data_control`, { $update_string: updateString })
  );

// Generate sibling bindings for elements
const siblingBindings = (): Binding[] =>
  HUD_COMPONENTS.map(({ controlName, updateString, bindingTarget }) =>
    siblingViewBinding(
      controlName,
      strip("#preserved_text", updateString),
      bindingTarget
    )
  );

// Generate control refs for visible elements (only those with namespace)
const elementRefs = (): ControlReference[] =>
  HUD_COMPONENTS.filter((c) => c.namespace).map(
    ({ controlName, refName, namespace, overrides }) => {
      const name =
        refName ??
        controlName.replace("_data_control", "").replace("_control", "");
      return ref(`${name}@${namespace}.main`, overrides);
    }
  );

// Data control template - parses title text updates
const dataControl = panel("data_control")
  .size(0, 0)
  .bindings(
    hudTitleBinding(),
    preservedTextBinding(),
    viewBinding(
      "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
      "#visible"
    )
  );

const renderers = panel("renderers").controls(...dataControlRefs());

const elements = panel("elements")
  .variable("offset", [0, 0])
  .rawProp("offset", "$offset")
  .rawProp("variables", [{ requires: "$pocket_screen", $offset: [0, 10] }])
  .bindings(...siblingBindings())
  .controls(...elementRefs());

export default defineUI("phud", (ns) => {
  ns.addAll(
    dataControl,
    renderers,
    elements,
    panel("main").fullSize().controls(renderers, elements)
  );
});
