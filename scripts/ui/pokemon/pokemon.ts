/**
 * Pokemon Starter Selection UI
 *
 * Pokemon starter picker interface.
 */

import {
  defineUI,
  image,
  label,
  panel,
  stackPanel,
  contains,
  equals,
  collectionBinding,
  factoryBindings,
  viewBinding,
  collectionDetailsBinding,
  imageTextureBindings,
  globalBinding,
} from "mcbe-ts-ui";

export default defineUI("pokemon", (ns) => {
  // Button stack factory
  ns.add(
    stackPanel("button_stack")
      .size("100%", "100%c")
      .vertical()
      .anchor("top_left")
      .rawProp("$button|default", "default_form.button")
      .rawProp("factory", { name: "buttons", control_name: "$button" })
      .rawProp("collection_name", "form_buttons")
      .bindings(
        ...factoryBindings(),
        viewBinding(contains("#title_text", "§s"), "#visible")
      )
  );

  // Pokemon text display
  ns.add(
    label("pokemon_text")
      .fontType("MinecraftTen")
      .text("#title_text")
      .textAlignment("left")
      .rawProp("line_padding", 2)
      .fontScaleFactor(1)
      .size("100%", "default")
      .anchor("top_middle")
      .offset("42%", -10)
      .layer(5)
      .rawProp("shadow", true)
      .bindings(globalBinding("#title_text"))
      .controls({
        data: {
          type: "label",
          font_type: "default",
          text: "#form_text",
          text_alignment: "left",
          line_padding: 2,
          color: "white",
          font_scale_factor: 1,
          anchor_from: "left_middle",
          anchor_to: "left_middle",
          size: ["40%", "default"],
          offset: ["20%", 50],
          layer: 5,
          shadow: true,
        },
      })
  );

  // Button action template (raw needed for complex $variable states)
  ns.addRaw("button_action", {
    type: "stack_panel",
    orientation: "vertical",
    anchor_from: "top_left",
    anchor_to: "top_left",
    size: ["100%", "100%"],
    "$color|default": "default",
    controls: [
      {
        entry_description: {
          size: ["100%", "100%"],
          layer: 2,
          type: "image",
          "$alpha|default": 0,
          variables: [{ requires: "($state = 'hover')", $alpha: 0.3, $color: "black" }],
          alpha: "$alpha",
          keep_ratio: false,
          controls: [
            {
              entry_description_label: {
                type: "image",
                color: "$color",
                bindings: imageTextureBindings(),
              },
            },
          ],
        },
      },
    ],
  });

  // Picker button
  ns.add(
    panel("button")
      .size("15%", 30)
      .controls({
        "button@common.button": {
          size: ["45%", "100%"],
          anchor_from: "top_middle",
          anchor_to: "top_middle",
          layer: 1,
          $pressed_button_name: "button.form_button_click",
          controls: [{ "default@pokemon.button_action": { $state: "default" } }, { "hover@pokemon.button_action": { $state: "hover" } }],
          bindings: [
            collectionDetailsBinding(),
            collectionBinding("#form_button_text"),
            viewBinding("(not ((#form_button_text = '') or (#form_button_text = 'loading')))", "#visible"),
          ],
        },
      })
      .bindings(collectionBinding("#form_button_text"))
  );

  // Icon (large pokemon display)
  ns.add(
    panel("icon")
      .size("100%", "8%x")
      .controls({
        "form_button@common.button": {
          "$default_state|default": false,
          "$hover_state|default": false,
          $pressed_button_name: "button.form_button_click",
          size: ["100%", "100%"],
          anchor_from: "top_middle",
          anchor_to: "top_middle",
          offset: [0, "-300%"],
          controls: [
            {
              image: {
                type: "image",
                anchor_to: "top_middle",
                anchor_from: "top_middle",
                layer: 5,
                size: ["400%y", "400%"],
                bindings: imageTextureBindings(),
              },
            },
          ],
          bindings: [collectionDetailsBinding()],
        },
      })
  );

  // Back button
  ns.add(
    panel("back_button")
      .size("100%", "8%x")
      .controls({
        "form_button@common.button": {
          $pressed_button_name: "button.form_button_click",
          "$default_state|default": false,
          "$hover_state|default": false,
          size: ["25%", "75%"],
          anchor_from: "middle_left",
          anchor_to: "middle_left",
          offset: ["-40%", "25%"],
          controls: [
            { arrow: { type: "image", size: ["50%", "100%x"], texture: "textures/ui/chevron_left", layer: 2 } },
            { hover: { type: "image", size: ["50%", "100%x"], texture: "textures/ui/chevron_left", layer: 2, color: "black" } },
          ],
          bindings: [collectionDetailsBinding()],
        },
      })
  );

  // Accept button
  ns.add(
    panel("accept_button")
      .size("100%", "8%x")
      .controls({
        "form_button@common.button": {
          $pressed_button_name: "button.form_button_click",
          "$default_state|default": false,
          "$hover_state|default": false,
          size: ["25%", "75%"],
          anchor_from: "middle_left",
          anchor_to: "middle_left",
          offset: [0, "200%"],
          controls: [
            {
              button: {
                type: "image",
                size: ["100%", "100%"],
                texture: "textures/ui/pokemon/background_default",
                layer: 2,
                controls: [{ text: { type: "label", font_type: "MinecraftTen", localize: false, text: "Start adventure !", color: "white", text_alignment: "center", font_scale_factor: 1, size: ["100%", "100%"], anchor_from: "center", anchor_to: "center", offset: [0, 5], layer: 10000 } }],
              },
            },
            {
              hover: {
                type: "image",
                size: ["100%", "100%"],
                texture: "textures/ui/pokemon/background_hover",
                layer: 2,
                controls: [{ text: { type: "label", font_type: "MinecraftTen", localize: false, text: "Start adventure !", color: "white", text_alignment: "center", font_scale_factor: 1, size: ["100%", "100%"], anchor_from: "center", anchor_to: "center", offset: [0, 5], layer: 10000 } }],
              },
            },
          ],
          bindings: [collectionDetailsBinding()],
        },
      })
  );

  // Select button (switches between back, accept, icon)
  ns.add(
    panel("select_button")
      .size("100%", "100%c")
      .controls(
        { "back_button@pokemon.back_button": { bindings: [viewBinding(equals("#texture", "back"), "#visible", "image")] } },
        { "accept_button@pokemon.accept_button": { bindings: [viewBinding(equals("#texture", "accept"), "#visible", "image")] } },
        { "pokemon_icon@pokemon.icon": { bindings: [collectionBinding("#form_button_text"), viewBinding(equals("#form_button_text", "§i§m§g"), "#visible")] } }
      )
  );

  // Picker panel grid (raw needed for grid_item_template and grid_rescaling_type)
  ns.addRaw("picker_panel_grid", {
    type: "grid",
    size: ["100%", "100%c"],
    offset: [0, 10],
    anchor_from: "top_middle",
    anchor_to: "top_middle",
    grid_item_template: "pokemon.button",
    grid_rescaling_type: "horizontal",
    collection_name: "form_buttons",
    bindings: [...factoryBindings(), viewBinding(contains("#title_text", "§1"), "#visible")],
  });

  // Pokemon panel grid
  ns.addRaw("pokemon_panel_grid@pokemon.button_stack", { size: ["98%", "100%c"], $button: "pokemon.select_button" });

  // Common panel
  ns.add(
    panel("common_panel")
      .anchor("middle")
      .offset(0, 5)
      .size("100% - 5px", "100%c")
      .controls({ "picker_panel_grid@pokemon.picker_panel_grid": {} }, { "pokemon_panel_grid@pokemon.pokemon_panel_grid": {} }, { "pokemon_text@pokemon.pokemon_text": {} })
  );

  // Main panel
  ns.add(
    image("main_panel")
      .texture("textures/ui/pokemon/background")
      .layer(1)
      .keepRatio(true)
      .fill(true)
      .anchor("center")
      .fullSize()
      .controls(
        {
          text_common: {
            type: "panel",
            anchor_from: "top_middle",
            anchor_to: "top_middle",
            size: ["60%", "30%"],
            offset: [0, "15%"],
            layer: 2,
            controls: [
              { hello: { type: "label", font_type: "default", localize: false, text: "Welcome to PokéBedrock !", color: "white", text_alignment: "center", font_scale_factor: 1, anchor_from: "top_middle", anchor_to: "top_middle", size: ["90%", 20], offset: [0, 0] } },
              { pick: { type: "label", font_type: "default", localize: false, text: "Now, please pick your desired starter Pokémon !", color: "white", text_alignment: "center", font_scale_factor: 1, anchor_from: "top_middle", anchor_to: "top_middle", size: ["90%", 20], offset: [0, 10] } },
            ],
          },
        },
        { button_panel: { type: "image", texture: "textures/ui/pokemon/background", color: "black", anchor_from: "bottom", anchor_to: "bottom", size: ["80%", "60%"], alpha: 0, offset: [0, 0], controls: [{ "common_panel@pokemon.common_panel": {} }] } }
      )
  );
});
