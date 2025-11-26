/**
 * Pokemon Sidebar HUD Element
 *
 * Displays a sidebar with up to 6 Pokemon slots showing:
 * - Pokemon name
 * - Pokemon stats
 * - Ball icon (caught with)
 * - Pokemon sprite icon
 * - Active indicator ring
 *
 * Uses variable parsing to extract data from a concatenated string.
 */

import {
  defineUI,
  varRef,
  panel,
  image,
  stackPanel,
  extend,
  phudVisibility,
  notEmpty,
  texturePath,
  variableParserBindings,
  sourceControlBinding,
  viewBinding,
  boundLabel,
  boundImage,
  ElementBuilder,
} from "mcbe-ts-ui";

// Pokemon slot indices - each pokemon has 6 data points
const POKEMON_DATA_SIZE = 6;
const pokemonIndexMap = {
  stats: 0,
  name: 1,
  id: 2,
  active: 3,
  caughtWith: 4,
  icon: 5,
} as const;

export default defineUI(
  "phud_sidebar",
  (ns) => {
    // Variable parser template - parses string data from #sidebar
    const variableParser = panel("variable_parser")
      .variableDefault("visible", "true")
      .bindings(...variableParserBindings());

    ns.add(variableParser);

    // Pokemon name label (extends variable_parser)
    const pokemonNameLabel = boundLabel("pokemon_name", "var")
      .extends(variableParser.getName())
      .enableProfanityFilter()
      .textAlignment("right")
      .linePadding(2)
      .layer(5)
      .color("$color")
      .fontScale(0.7);

    // Pokemon name wrapper panel
    const pokemonNameWrapper = panel("pokemon_name_wrapper")
      .variable("var_index", varRef("pokemon_name_index"))
      .size("default", 5)
      .controls(pokemonNameLabel);

    // Padding between name and stats
    const namePadding = panel("padding").size("default", 3);

    // Pokemon stats label (extends variable_parser)
    const pokemonStatsLabel = boundLabel("pokemon_stats", "var")
      .extends(variableParser.getName())
      .layer(5)
      .textAlignment("right")
      .linePadding(2)
      .color("$color")
      .fontScale(0.5);

    // Pokemon stats wrapper panel
    const pokemonStatsWrapper = panel("pokemon_stats_wrapper")
      .variable("var_index", varRef("pokemon_stats_index"))
      .size("default", 5)
      .controls(pokemonStatsLabel);

    // Stack panel for name and stats
    const pokemonDataStack = stackPanel("pokemon_data_stack", "vertical")
      .size("default", "90%c")
      .controls(pokemonNameWrapper, namePadding, pokemonStatsWrapper);

    // Pokemon data image (extends variable_parser)
    const pokemonDataImage = image("pokemon_data", "textures/ui/sidebar/data")
      .extends(variableParser.getName())
      .offset("-7%", "0%")
      .size("80%", "90%")
      .layer(2)
      .variable("visible", "(not(#var = 'null'))")
      .controls(pokemonDataStack);

    // Pokemon sprite icon
    const pokemonIcon = boundImage("pokemon_icon")
      .offset("0%", "-15%")
      .size(40)
      .variable("var_index", varRef("pokemon_icon_index"))
      .layer(4);
    pokemonIcon.bindings(
      sourceControlBinding("elements", "#sidebar", "#string"),
      viewBinding("$string_parser", "#pokemon_icon"),
      viewBinding(
        texturePath("textures/sprites/", "#pokemon_icon"),
        `#${pokemonIcon.bindingName}`
      ),
      viewBinding(notEmpty("#pokemon_icon").replace("''", "'null'"), "#visible")
    );

    // Ball icon image
    const ballIcon = boundImage("ball_icon")
      .size(40)
      .layer(3)
      .controls(pokemonIcon);
    ballIcon.bindings(
      sourceControlBinding("elements", "#sidebar", "#string"),
      viewBinding("$string_parser", "#ball_type"),
      viewBinding(
        texturePath("textures/ui/sidebar/balls/", "#ball_type"),
        `#${ballIcon.bindingName}`
      )
    );

    // Pokemon icon wrapper panel
    const pokemonIconWrapper = panel("pokemon_icon_wrapper")
      .variable("var_index", varRef("pokemon_caughtWith_index"))
      .controls(ballIcon);

    // Active indicator ring (extends variable_parser)
    const activeIcon = image("active_icon", "textures/ui/sidebar/ring")
      .extends(variableParser.getName())
      .size(40)
      .layer(5)
      .variable("visible", "#var");

    // Pokemon selected indicator panel
    const pokemonSelectedIndicator = panel("pokemon_selected_indicator")
      .variable("var_index", varRef("pokemon_active_index"))
      .controls(activeIcon);

    // Pokemon sidebar slot template
    const pokemonSlotTemplate = panel("pokemon_sidebar_pokemon")
      .size("default", 30)
      .variableDefaults({
        pokemon_stats_index: 0,
        pokemon_id_index: 1,
        pokemon_name_index: 2,
        pokemon_active_index: 3,
        pokemon_caughtWith_index: 4,
        pokemon_icon_index: 5,
      })
      .variable("var_index", varRef("pokemon_id_index"))
      .controls(pokemonDataImage, pokemonIconWrapper, pokemonSelectedIndicator);

    ns.add(pokemonSlotTemplate);

    // Slot padding template
    const slotPaddingTemplate = panel("slot_padding").size("default", 1);
    ns.add(slotPaddingTemplate);

    // Pokemon holder stack panel with slots
    const pokemonHolder = stackPanel("pokemon_holder", "vertical").size(
      "default",
      "100%c"
    );

    // Add pokemon slots with padding between them
    let controls: ElementBuilder[] = [];
    for (let slotIndex = 0; slotIndex < 6; slotIndex++) {
      const slotTemplate = extend(
        `pokemon_${slotIndex + 1}`,
        pokemonSlotTemplate
      );

      // Append variables to the slot template
      const base = slotIndex * POKEMON_DATA_SIZE;
      for (const key in pokemonIndexMap)
        slotTemplate.variable(
          `pokemon_${key}_index`,
          base + pokemonIndexMap[key]
        );
      controls.push(slotTemplate);

      // Add padding after each slot (except last)
      if (slotIndex >= 5) continue;
      controls.push(extend(`padding_${slotIndex + 1}`, slotPaddingTemplate));
    }

    pokemonHolder.controls(...controls);

    // Main sidebar container
    ns.add(
      image("main", "textures/ui/sidebar/dock")
        .anchor("right_middle")
        .size("default", "80%")
        .offset("47%", "0%")
        .layer(1)
        .variable("var_size", 121)
        .controls(pokemonHolder)
        .bindings(...phudVisibility("#sidebar"))
    );
  },
  { subdir: "phud" }
);
