/**
 * PC Storage UI
 *
 * Pokemon PC box storage interface with navigation and action buttons.
 */

import {
  defineUI,
  panel,
  image,
  stackPanel,
  viewBinding,
  globalBinding,
  strip,
  skip,
  first,
  extendRaw,
  boundLabel,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  buttonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  simpleButtonTextures,
  buttonTextureProps,
} from "./shared";

export default defineUI("pc", (ns) => {
  // Button stack factory
  ns.add(buttonStack);

  // Base button template - uses raw due to complex $variable bindings
  ns.addRaw("button", {
    type: "panel",
    size: ["100%", "100%"],
    "$offset|default": ["0%", "0%"],
    "$text_offset|default": ["0%", "0%"],
    "$text_anchor_location|default": "center",
    "$text_alignment|default": "left",
    "$text_font_scale_factor|default": 0.6,
    "$image_size|default": ["0%", "0%"],
    "$image_offset|default": ["0%", "0%"],
    controls: [
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          anchor_from: "center",
          anchor_to: "center",
          size: ["100%", "100%"],
          offset: "$offset",
          bindings: formButtonEnabledBindings(),
        },
      },
      {
        text: {
          type: "label",
          size: ["100%", "100%"],
          offset: "$text_offset",
          layer: 10,
          anchor_from: "$text_anchor_location",
          anchor_to: "$text_anchor_location",
          text: "#text",
          font_scale_factor: "$text_font_scale_factor",
          text_alignment: "$text_alignment",
          color: "white",
          bindings: formButtonTextLabelBindings(),
        },
      },
      {
        image: {
          type: "image",
          size: "$image_size",
          offset: "$image_offset",
          layer: 11,
          bindings: formButtonImageBindings(),
        },
      },
    ],
  });

  // Button variants - extending base button with different textures
  ns.addRaw("left_arrow_button@pc.button", {
    ...buttonTextureProps(simpleButtonTextures("textures/ui/pc", "left_arrow")),
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:left_arrow"),
  });

  ns.addRaw("right_arrow_button@pc.button", {
    ...buttonTextureProps(
      simpleButtonTextures("textures/ui/pc", "right_arrow")
    ),
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:right_arrow"),
  });

  ns.addRaw("icon_button@pc.button", {
    $default_button_texture: "textures/ui/pc/icon_box",
    $hover_button_texture: "textures/ui/pc/icon_box",
    $pressed_button_texture: "textures/ui/pc/icon_box",
    $locked_button_texture: "textures/ui/pc/icon_box",
    $image_size: [54, 54],
    $image_offset: [0, -7],
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:icon"),
  });

  ns.addRaw("action_button@pc.button", {
    ...buttonTextureProps(
      simpleButtonTextures("textures/ui/pc", "action_button")
    ),
    $text_offset: [0, -3],
    $button_image_fill: false,
    $border_visible: false,
    bindings: visibilityForId("btn:action"),
  });

  const leftContentBoxHeader = boundLabel("header_text")
    .size(64, 8)
    .fontScaleFactor(0.7)
    .color("white")
    .offset(3, 0)
    .anchor("top_left")
    .textAlignment("center")
    .bindings(
      globalBinding("#form_text"),
      viewBinding(strip(first(40, "#form_text")), "#text")
    );

  const leftContentBoxBody = boundLabel("body_text")
    .size(64, 95)
    .fontScaleFactor(0.6)
    .color("white")
    .anchor("top_left")
    .bindings(
      globalBinding("#form_text"),
      viewBinding(strip(skip(40, "#form_text")), "#text")
    );

  const leftContentBox = image("left_content_box", "textures/ui/pc/content_box")
    .size(73, 115)
    .controls(
      extendRaw("close_button", "common.light_close_button", {
        $close_button_offset: [3, -3],
      }),
      stackPanel("content_stack", "vertical")
        .offset(5, 4)
        .controls(leftContentBoxHeader, leftContentBoxBody)
    );

  // Title box with navigation arrows
  ns.add(
    image("title_box", "textures/ui/pc/title_box")
      .size("100%", 17)
      .controls(
        stackPanel("box_details", "horizontal").controls(
          panel("start_padding").size(5, "100%"),
          {
            "left_button@pc.button_stack": {
              size: [11, "100%"],
              layer: 3,
              anchor_from: "center",
              anchor_to: "center",
              $button: "pc.left_arrow_button",
            },
          },
          panel("title")
            .size(84, "100%")
            .offset(0, 7)
            .layer(3)
            .controls(
              panel("text")
                .rawProp("type", "label")
                .rawProp("text", "#title_text")
                .rawProp("text_alignment", "center")
                .rawProp("font_scale_factor", 0.95)
            ),
          {
            "right_button@pc.button_stack": {
              size: [11, "100%"],
              layer: 3,
              anchor_from: "center",
              anchor_to: "center",
              $button: "pc.right_arrow_button",
            },
          },
          panel("end_padding").size(5, "100%")
        )
      )
  );

  // Container slots with grid
  ns.add(
    image("container_slots", "textures/ui/pc/container_slots")
      .size("100%", 105)
      .controls(
        panel("small_chest_grid")
          .rawProp("type", "grid")
          .rawProp("grid_dimensions", [6, 6])
          .size(108, 118)
          .offset(5, 5)
          .anchor("top_left")
          .rawProp("grid_item_template", "chest_ui.chest_item")
          .rawProp("collection_name", "form_buttons")
          .layer(1)
      )
  );

  // Party slots image
  ns.add(image("party_slots", "textures/ui/pc/party_slots").size("100%", 26));

  // Center grid stack
  ns.add(
    stackPanel("center_grid", "vertical")
      .size(116, "100%c")
      .controls(
        { "title_box@pc.title_box": {} },
        panel("spacer1").size("100%", 1),
        { "container_slots@pc.container_slots": {} },
        panel("spacer2").size("100%", 1.5),
        { "party_slots@pc.party_slots": {} }
      )
  );

  // Right content (icon and action)
  ns.add(
    stackPanel("right_content", "vertical")
      .size(71, "100%c")
      .controls(
        {
          "icon_box@pc.button_stack": {
            size: ["100%", 70],
            layer: 3,
            anchor_from: "center",
            anchor_to: "center",
            $button: "pc.icon_button",
          },
        },
        panel("spacer").size("100%", 0.5),
        {
          "action_button@pc.button_stack": {
            size: ["100%", 18],
            layer: 3,
            anchor_from: "center",
            anchor_to: "center",
            $button: "pc.action_button",
          },
        }
      )
  );

  // Main PC layout
  ns.add(
    stackPanel("main", "horizontal")
      .offset("25%", "25%")
      .anchor("center")
      .controls(
        leftContentBox,
        panel("spacer1").size(2, "100%"),
        { "center_grid@pc.center_grid": {} },
        panel("spacer2").size(1, "100%"),
        { "right_content@pc.right_content": {} }
      )
  );
});
