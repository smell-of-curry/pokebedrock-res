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

import { defineUI, image, label, panel, stackPanel } from "mcbe-ts-ui";
import { phudVisibility } from "./_helpers";
import { notEmpty, texturePath } from "./_string_parser";

// Pokemon slot indices - each pokemon has 6 data points
const POKEMON_DATA_SIZE = 6;

interface PokemonIndices {
  stats: number;
  name: number;
  id: number;
  active: number;
  caughtWith: number;
  icon: number;
}

function getPokemonIndices(slotIndex: number): PokemonIndices {
  const base = slotIndex * POKEMON_DATA_SIZE;
  return {
    stats: base + 0,
    name: base + 1,
    id: base + 2,
    active: base + 3,
    caughtWith: base + 4,
    icon: base + 5,
  };
}

export default defineUI(
  "phud_sidebar",
  (ns) => {
    // Variable parser template - parses string data from #sidebar
    ns.addRaw("variable_parser", {
      "$visible|default": "true",
      bindings: [
        {
          binding_name: "#null",
          binding_type: "view",
          source_control_name: "elements",
          source_property_name: "#sidebar",
          target_property_name: "#string",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name: "$string_parser",
          target_property_name: "#var",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name: "$visible",
          target_property_name: "#visible",
        },
      ],
    });

    // Pokemon sidebar slot template
    ns.addRaw("pokemon_sidebar_pokemon", {
      type: "panel",
      size: ["100%", 30],
      "$pokemon_stats_index|default": 0,
      "$pokemon_id_index|default": 1,
      "$pokemon_name_index|default": 2,
      "$pokemon_active_index|default": 3,
      "$pokemon_caughtWith_index|default": 4,
      "$pokemon_icon_index|default": 5,
      $var_index: "$pokemon_id_index",
      controls: [
        {
          "pokemon_data@variable_parser": {
            type: "image",
            offset: ["-7%", "0%"],
            texture: "textures/ui/sidebar/data",
            size: ["80%", "90%"],
            layer: 2,
            $visible: "(not(#var = 'null'))",
            controls: [
              {
                pokemon_data_stack: {
                  type: "stack_panel",
                  size: ["100%", "90%c"],
                  controls: [
                    {
                      pokemon_name_wrapper: {
                        type: "panel",
                        $var_index: "$pokemon_name_index",
                        size: ["100%", 5],
                        controls: [
                          {
                            "pokemon_name@variable_parser": {
                              type: "label",
                              enable_profanity_filter: true,
                              text_alignment: "right",
                              line_padding: 2,
                              layer: 5,
                              color: "$color",
                              alpha: 1,
                              text: "#var",
                              font_scale_factor: 0.7,
                            },
                          },
                        ],
                      },
                    },
                    {
                      padding: {
                        type: "panel",
                        size: ["100%", 3],
                      },
                    },
                    {
                      pokemon_stats_wrapper: {
                        type: "panel",
                        $var_index: "$pokemon_stats_index",
                        size: ["100%", 5],
                        controls: [
                          {
                            "pokemon_stats@variable_parser": {
                              type: "label",
                              text: "#var",
                              layer: 5,
                              text_alignment: "right",
                              line_padding: 2,
                              color: "$color",
                              font_scale_factor: 0.5,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          pokemon_icon_wrapper: {
            type: "panel",
            $var_index: "$pokemon_caughtWith_index",
            controls: [
              {
                ball_icon: {
                  type: "image",
                  size: [40, "100%"],
                  layer: 3,
                  texture: "#texture",
                  bindings: [
                    {
                      binding_name: "#null",
                      binding_type: "view",
                      source_control_name: "elements",
                      source_property_name: "#sidebar",
                      target_property_name: "#string",
                    },
                    {
                      binding_name: "#null",
                      binding_type: "view",
                      source_property_name: "$string_parser",
                      target_property_name: "#ball_type",
                    },
                    {
                      binding_name: "#null",
                      binding_type: "view",
                      source_property_name: texturePath(
                        "textures/ui/sidebar/balls/",
                        "#ball_type"
                      ),
                      target_property_name: "#texture",
                    },
                  ],
                  controls: [
                    {
                      pokemon_icon: {
                        type: "image",
                        offset: ["0%", "-15%"],
                        size: [40, "100%"],
                        $var_index: "$pokemon_icon_index",
                        layer: 4,
                        bindings: [
                          {
                            binding_name: "#null",
                            binding_type: "view",
                            source_control_name: "elements",
                            source_property_name: "#sidebar",
                            target_property_name: "#string",
                          },
                          {
                            binding_name: "#null",
                            binding_type: "view",
                            source_property_name: "$string_parser",
                            target_property_name: "#pokemon_icon",
                          },
                          {
                            binding_name: "#null",
                            binding_type: "view",
                            source_property_name: texturePath(
                              "textures/sprites/",
                              "#pokemon_icon"
                            ),
                            target_property_name: "#texture",
                          },
                          {
                            binding_name: "#null",
                            binding_type: "view",
                            source_property_name: notEmpty("#pokemon_icon").replace(
                              "''",
                              "'null'"
                            ),
                            target_property_name: "#visible",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          pokemon_selected_indicator: {
            type: "panel",
            $var_index: "$pokemon_active_index",
            controls: [
              {
                "active_icon@variable_parser": {
                  type: "image",
                  size: [40, "100%"],
                  layer: 5,
                  texture: "textures/ui/sidebar/ring",
                  $visible: "#var",
                },
              },
            ],
          },
        },
      ],
    });

    // Generate pokemon slot controls with padding
    const pokemonSlots: object[] = [];
    for (let i = 0; i < 6; i++) {
      const indices = getPokemonIndices(i);
      pokemonSlots.push({
        [`pokemon${i + 1}@pokemon_sidebar_pokemon`]: {
          $pokemon_stats_index: indices.stats,
          $pokemon_name_index: indices.name,
          $pokemon_id_index: indices.id,
          $pokemon_active_index: indices.active,
          $pokemon_caughtWith_index: indices.caughtWith,
          $pokemon_icon_index: indices.icon,
        },
      });

      // Add padding after each slot (except last)
      if (i < 5) {
        pokemonSlots.push({
          [`padding_${i + 1}`]: {
            type: "panel",
            size: ["100%", 1],
          },
        });
      }
    }

    // Pokemon holder stack panel
    const pokemonHolder = stackPanel("pokemon_holder")
      .vertical()
      .size("100%", "100%c")
      .rawProp("controls", pokemonSlots);

    // Main sidebar container
    ns.add(
      image("main")
        .texture("textures/ui/sidebar/dock")
        .anchor("right_middle")
        .size("100%", "80%")
        .offset("47%", "0%")
        .layer(1)
        .alpha(1)
        .rawProp("$var_size", 121)
        .controls(pokemonHolder)
        .bindings(...phudVisibility("#sidebar"))
    );
  },
  { subdir: "phud" }
);

