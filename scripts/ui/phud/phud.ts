import {
  Binding,
  ControlReference,
  defineUI,
  extend,
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
  namespace?: string;
}

// All HUD components defined in one place
const HUD_COMPONENTS: HudComponent[] = [
  {
    updateString: "&_currency:",
    controlName: "currency_control",
    bindingTarget: "#level_number",
    namespace: "phud_currency",
  },
  {
    updateString: "&_phone:",
    controlName: "phone_control",
    bindingTarget: "#phone",
    namespace: "phud_phone",
  },
  {
    updateString: "&_battleWait:",
    controlName: "battleWait_control",
    bindingTarget: "#battleLog",
    namespace: "phud_battleWait",
  },
  {
    updateString: "&_loadingScreen:",
    controlName: "loadingScreen_control",
    bindingTarget: "#loadingScreen",
    namespace: "phud_loadingScreen",
  },
  {
    updateString: "&_evolutionWait:",
    controlName: "evolutionWait_control",
    bindingTarget: "#evolutionWait",
    namespace: "phud_evolutionWait",
  },
  {
    updateString: "&_sidebar:",
    controlName: "sidebar_control",
    bindingTarget: "#sidebar",
    namespace: "phud_sidebar",
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
    // doesn't need namespace, because its handled by hud_screen
  },
];

export default defineUI("phud", (ns) => {
  // Data control template - parses title text updates
  const [dataControl, ns1] = ns.add(
    panel("data_control")
      .size(0, 0)
      .bindings(
        hudTitleBinding(),
        preservedTextBinding(),
        viewBinding(
          "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
          "#visible"
        )
      )
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
      ({ controlName, namespace }) => ref(`${controlName}@${namespace}.main`)
    );

  const renderers = panel("renderers").controls(
    ...HUD_COMPONENTS.map(({ controlName, updateString }) =>
      extend(controlName, dataControl).variable("update_string", updateString)
    )
  );

  const elements = panel("elements")
    .variable("offset", [0, 0])
    .rawProp("offset", "$offset")
    .rawProp("variables", [{ requires: "$pocket_screen", $offset: [0, 10] }])
    .bindings(...siblingBindings())
    .controls(...elementRefs());

  return ns1.setMain(panel("main").fullSize().controls(renderers, elements));
});
