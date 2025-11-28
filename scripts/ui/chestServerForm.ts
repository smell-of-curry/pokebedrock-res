/**
 * Chest Server Form UI
 *
 * Custom chest-like form interfaces with multiple layout variants.
 */

import {
  defineUI,
  panel,
  stackPanel,
  contains,
  boundImage,
  collectionBinding,
  viewBinding,
} from "mcbe-ts-ui";

// Flag constants for chest type detection
const FLAGS = {
  inventoryChest: "§c§h§e§s§t§s§i§n§v§e§n§t",
  singleChest: "§c§h§e§s§t§s§i§n§g§l§e§r",
  tinyChest: "§c§h§e§s§t§t§i§n§n§y§r",
  smallChest: "§c§h§e§s§t§s§m§a§l§l",
  largeChest: "§c§h§e§s§t§l§a§r§g§e",
  questChest: "§c§h§e§s§t§s§q§u§e§s§t§s",
  questChestLarge: "§c§h§e§s§t§s§l§u§e§s§t§s",
  pokebuilder: "§c§h§e§s§t§p§o§k§b§u§i§l",
  pokebuilderLarge: "§c§h§e§s§t§p§o§k§e§b§u§L",
  backpack: "§c§h§e§s§t§s§b§a§c§k§p§a",
  auctionHouse: "§c§h§e§s§t§a§u§c§t§i§o§n",
} as const;

// Texture bindings for item renderer
const textureBindings = [
  {
    binding_name: "#form_button_texture",
    binding_type: "collection",
    binding_collection_name: "form_buttons",
  },
  {
    binding_type: "view",
    source_property_name:
      "(not (('%.8s' * #form_button_texture) = 'textures'))",
    target_property_name: "#visible",
  },
  {
    binding_type: "view",
    source_property_name:
      "(not ((#form_button_texture = '') or (#form_button_texture = 'loading')))",
    target_property_name: "#visible",
  },
  {
    binding_type: "view",
    source_property_name: "(#form_button_texture * 1)",
    target_property_name: "#item_id_aux",
  },
];

// Helper to create visibility bindings for chest type
const chestVisibilityBindings = (flag: string) => [
  { binding_name: "#title_text" },
  {
    binding_name: "#null",
    binding_type: "view" as const,
    source_property_name: contains("#title_text", flag),
    target_property_name: "#visible",
  },
];

export default defineUI("chest_ui", (ns) => {
  // Chest label
  ns.addRaw("chest_label", {
    type: "label",
    offset: [7, 10],
    anchor_from: "top_left",
    anchor_to: "top_left",
    text: "#title_text",
    size: ["90%", "default"],
    color: "$title_text_color",
    layer: 2,
  });

  // Inventory text
  ns.addRaw("inventory_text", {
    type: "label",
    anchor_from: "top_left",
    anchor_to: "top_left",
    offset: [7, "$y_offset"],
    size: ["90%", "default"],
    layer: 2,
    color: "$title_text_color",
    text: "container.inventory",
  });

  // Non-renderer item (texture-based)
  boundImage("non_renderer_item", "#texture")
    .size(16, 16)
    .bindings(
      collectionBinding("#form_button_texture"),
      viewBinding(
        "(not ((#texture = '') or (#texture = 'loading')))",
        "#visible"
      ),
      viewBinding("(('%.8s' * #texture) = 'textures')", "#visible")
    )
    .addToNamespace(ns);

  // Inventory button amount display
  ns.addRaw("inventory_button_amount", {
    type: "panel",
    offset: "$offset",
    controls: [
      {
        item_amount: {
          type: "label",
          offset: [0, 1],
          shadow: true,
          text_alignment: "left",
          anchor_from: "bottom_right",
          anchor_to: "bottom_right",
          color: "$tool_tip_text",
          layer: 4,
          text: "#stack_size",
          bindings: [
            {
              binding_name: "#null",
              binding_type: "collection",
              binding_condition: "none",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#null",
              binding_type: "collection_details",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#form_button_text",
              binding_type: "collection",
              binding_collection_name: "form_buttons",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name:
                "((#form_button_text - 'stack#01') = #form_button_text)",
              target_property_name: "#visible",
            },
            {
              binding_name: "#null",
              binding_type: "view",
              source_property_name:
                "(('§z') + (('%.12s' * #form_button_text) - ('%.10s' * #form_button_text)))",
              target_property_name: "#stack_size",
            },
          ],
        },
      },
    ],
  });

  // Default control state
  ns.addRaw("default_control", {
    type: "panel",
    size: ["100%c", "100%c"],
    layer: 3,
    controls: [
      {
        "item_block@beacon.item_renderer": {
          size: [16, 16],
          offset: "$offset",
          bindings: "$texture_bindings",
        },
      },
      { "non_renderer_item@chest_ui.non_renderer_item": { offset: "$offset" } },
    ],
  });

  // Hover control with tooltip
  ns.addRaw("hover_control", {
    type: "panel",
    size: ["100%c", "100%c"],
    offset: "$offset",
    controls: [
      {
        hovering_image: {
          type: "panel",
          size: [18, 18],
          controls: [
            {
              item_details: {
                type: "custom",
                renderer: "hover_text_renderer",
                allow_clipping: false,
                layer: 30,
                bindings: [
                  {
                    binding_name: "#form_button_text",
                    binding_type: "collection",
                    binding_collection_name: "form_buttons",
                  },
                  {
                    binding_name: "#null",
                    binding_type: "view",
                    source_property_name:
                      "(#form_button_text - ('%.12s' * #form_button_text))",
                    target_property_name: "#hover_text",
                  },
                  {
                    binding_name: "#null",
                    binding_type: "collection_details",
                    binding_collection_name: "form_buttons",
                  },
                ],
              },
            },
            {
              "item_block@beacon.item_renderer": {
                size: [16, 16],
                bindings: "$texture_bindings",
                layer: 3,
                offset: [1, 1],
              },
            },
            { "non_renderer_item@chest_ui.non_renderer_item": { layer: 3 } },
            {
              highlight_slot: {
                type: "image",
                size: [18, 18],
                texture: "textures/ui/highlight_slot",
                layer: 0,
              },
            },
            {
              focus_border: {
                type: "image",
                size: [18, 18],
                texture: "textures/ui/focus_border_white",
                layer: 1,
              },
            },
          ],
        },
      },
    ],
  });

  // Pressed control
  ns.addRaw("pressed_control", {
    type: "panel",
    size: ["100%c", "100%c"],
    controls: [
      {
        "item_block@beacon.item_renderer": {
          size: [16, 16],
          offset: "$offset",
          bindings: "$texture_bindings",
        },
      },
      { "non_renderer_item@chest_ui.non_renderer_item": { offset: "$offset" } },
    ],
  });

  // Inventory button base
  ns.addRaw("inventory_button@common.button", {
    $pressed_button_name: "button.form_button_click",
    default_control: "default",
    hover_control: "hover",
    pressed_control: "pressed",
    offset: "$offset",
    $texture_bindings: textureBindings,
    controls: [
      { "inventory_button_amount@chest_ui.inventory_button_amount": {} },
      { "default@chest_ui.default_control": {} },
      { "hover@chest_ui.hover_control": {} },
      { "pressed@chest_ui.pressed_control": {} },
    ],
  });

  // UI item buttons with visibility filters
  ns.addRaw("ui_chest_item@chest_ui.inventory_button", {
    $offset: [0, 0],
    bindings: [
      {
        binding_name: "#null",
        binding_type: "collection",
        binding_condition: "none",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "collection_details",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: "(('%.4s' * #form_button_text) = 'cht:')",
        target_property_name: "#visible",
      },
    ],
  });

  ns.addRaw("ui_inventory_item@chest_ui.inventory_button", {
    $offset: [0, 8],
    bindings: [
      {
        binding_name: "#null",
        binding_type: "collection",
        binding_condition: "none",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "collection_details",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: "(('%.4s' * #form_button_text) = 'inv:')",
        target_property_name: "#visible",
      },
    ],
  });

  ns.addRaw("ui_hot_bar_item@chest_ui.inventory_button", {
    $offset: [0, 8],
    bindings: [
      {
        binding_name: "#null",
        binding_type: "collection",
        binding_condition: "none",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "collection_details",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#form_button_text",
        binding_type: "collection",
        binding_collection_name: "form_buttons",
      },
      {
        binding_name: "#null",
        binding_type: "view",
        source_property_name: "(('%.4s' * #form_button_text) = 'hot:')",
        target_property_name: "#visible",
      },
    ],
  });

  stackPanel("chest_item", "vertical")
    .rawProp("$item_size|default", [16, 16])
    .rawProp("size", "$item_size")
    .layer(2)
    .controls(
      { "chest_item@chest_ui.ui_chest_item": {} },
      { "inventory_item@chest_ui.ui_inventory_item": {} },
      { "hot_bar_item@chest_ui.ui_hot_bar_item": {} }
    )
    .addToNamespace(ns);

  // Inventory chest grid (4 rows)
  ns.addRaw("inventory_chest_grid_image", {
    type: "image",
    size: [176, 96],
    texture: "textures/ui/gui/inventory",
    layer: 0,
    controls: [
      { "chest_label@chest_ui.chest_label": { offset: [7, 5] } },
      { "close_button@common.close_button": { $close_button_offset: [-2, 1] } },
      {
        inventory_grid: {
          type: "grid",
          grid_dimensions: [9, 4],
          size: ["100% - 17px", "100% - 22px"],
          offset: [8, 9],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.inventoryChest),
  });

  // Single chest grid (5 rows)
  ns.addRaw("single_chest_grid_image", {
    type: "image",
    size: [176, 130],
    texture: "textures/ui/gui/generic_1",
    layer: 0,
    controls: [
      { "chest_label@chest_ui.chest_label": {} },
      { "close_button@common.close_button": { $close_button_offset: [-2, 2] } },
      {
        single_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 5],
          size: ["100% - 17px", "100% - 32px"],
          offset: [8, 22],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
      {
        "inventory_text@chest_ui.inventory_text": { $y_offset: "100% - 90px" },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.singleChest),
  });

  // Tiny chest grid (1 row)
  ns.addRaw("tiny_chest_grid_image", {
    type: "image",
    size: [176, 130],
    texture: "textures/ui/gui/generic_9",
    layer: 0,
    controls: [
      { "chest_label@chest_ui.chest_label": {} },
      { "close_button@common.close_button": { $close_button_offset: [-2, 2] } },
      {
        small_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 1],
          size: ["100% - 14px", "100% - 112px"],
          offset: [7, 21],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
      {
        "inventory_text@chest_ui.inventory_text": { $y_offset: "100% - 90px" },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.tinyChest),
  });

  // Small chest grid (8 rows)
  ns.addRaw("small_chest_grid_image", {
    type: "image",
    size: [176, 166],
    texture: "textures/ui/gui/generic_27",
    layer: 0,
    controls: [
      { "chest_label@chest_ui.chest_label": {} },
      { "close_button@common.close_button": { $close_button_offset: [-2, 2] } },
      {
        small_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 8],
          size: ["100% - 14px", "100% - 27px"],
          offset: [7, 21],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
      {
        "inventory_text@chest_ui.inventory_text": { $y_offset: "100% - 90px" },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.smallChest),
  });

  // Large chest grid (6 rows)
  ns.addRaw("large_chest_grid_image", {
    type: "image",
    size: [176, 220],
    texture: "textures/ui/gui/generic_54",
    layer: 0,
    controls: [
      { "chest_label@chest_ui.chest_label": {} },
      {
        "close_button@common.light_close_button": {
          $close_button_offset: [-2, 2],
        },
      },
      {
        large_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 6],
          size: ["100% - 17px", "100% - 112px"],
          offset: [7, 21],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
      {
        "inventory_text@chest_ui.inventory_text": { $y_offset: "100% - 90px" },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.largeChest),
  });

  // Quest chest grid
  ns.addRaw("quests_grid_image", {
    type: "image",
    size: [185, 128],
    offset: [0, -5],
    texture: "textures/ui/quests/chest_screen",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-10, 52] },
      },
      {
        quest_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 3],
          size: ["100% - 32px", "100% - 80px"],
          offset: [17, 67],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.questChest),
  });

  // Quest chest grid large
  ns.addRaw("quests_grid_large_image", {
    type: "image",
    size: [185, 179],
    offset: [0, -5],
    texture: "textures/ui/quests/chest_screen_large",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-10, 52] },
      },
      {
        quest_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 6],
          size: ["100% - 32px", "100% - 80px"],
          offset: [17, 67],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.questChestLarge),
  });

  // Pokebuilder grid
  ns.addRaw("pokebuilder_grid_image", {
    type: "image",
    size: [200, 200],
    offset: [0, -5],
    texture: "textures/ui/pokebuilder/27_slot_pokebuilder",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-4, 94] },
      },
      {
        pokebuilder_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 3],
          size: ["100% - 41px", "100% - 146px"],
          offset: [20, 114],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.pokebuilder),
  });

  // Pokebuilder grid large
  ns.addRaw("pokebuilder_grid_large_image", {
    type: "image",
    size: [200, 200],
    offset: [0, -5],
    texture: "textures/ui/pokebuilder/45_slot_pokebuilder",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-10, 52] },
      },
      {
        pokebuilder_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 6],
          size: ["100% - 32px", "100% - 80px"],
          offset: [17, 67],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.pokebuilderLarge),
  });

  // Backpack grid
  ns.addRaw("backpack_grid", {
    type: "image",
    size: [245, 216],
    offset: [0, -5],
    texture: "textures/ui/gui/backpack",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-20, 10] },
      },
      {
        quest_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 10],
          size: ["100% - 83px", "100% - 36px"],
          offset: [33, 41],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.backpack),
  });

  // Auction house grid
  ns.addRaw("auction_house_grid", {
    type: "image",
    size: [206, 186],
    offset: [0, -5],
    texture: "textures/ui/gui/auction",
    layer: 0,
    controls: [
      {
        "close_button@common.close_button": { $close_button_offset: [-20, 40] },
      },
      {
        quest_chest_grid: {
          type: "grid",
          grid_dimensions: [9, 6],
          size: ["100% - 47px", "100% - 78px"],
          offset: [20, 58],
          anchor_from: "top_left",
          anchor_to: "top_left",
          grid_item_template: "chest_ui.chest_item",
          collection_name: "form_buttons",
          layer: 1,
        },
      },
    ],
    bindings: chestVisibilityBindings(FLAGS.auctionHouse),
  });

  // Main chest panel containing all variants

  const [, finalNs] = ns.add(
    panel("main").size("100%c", "100%c").controls(
      {
        "inventory_chest_grid_image@chest_ui.inventory_chest_grid_image": {},
      },
      { "single_chest_grid_image@chest_ui.single_chest_grid_image": {} },
      { "tiny_chest_grid_image@chest_ui.tiny_chest_grid_image": {} },
      { "small_chest_grid_image@chest_ui.small_chest_grid_image": {} },
      { "large_chest_grid_image@chest_ui.large_chest_grid_image": {} },
      { "quests_grid_image@chest_ui.quests_grid_image": {} },
      { "quests_grid_large_image@chest_ui.quests_grid_large_image": {} },
      { "pokebuilder_grid_image@chest_ui.pokebuilder_grid_image": {} },
      {
        "pokebuilder_grid_large_image@chest_ui.pokebuilder_grid_large_image":
          {},
      },
      { "backpack_grid@chest_ui.backpack_grid": {} },
      { "auction_house_grid@chest_ui.auction_house_grid": {} }
    )
  );
  return finalNs;
});
