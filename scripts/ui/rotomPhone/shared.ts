/**
 * Shared utilities for Rotom Phone UI pages
 */

import {
  panel,
  stackPanel,
  contains,
  collectionBinding,
  factoryBindings,
  viewBinding,
  collectionDetailsBinding,
  imageTextureBindings,
  siblingImageVisibilityBinding,
  globalBinding,
  NamespaceBuilder,
  SizeValue,
  Size,
  PanelBuilder,
} from "mcbe-ts-ui";

// Common button flag prefixes
export const FLAGS = {
  image: "§i§i§r",
  top: "§t§r",
  leftBig: "§l§b§r",
  leftBigImage: "§l§b§i§r",
  leftBigSpecial: "§l§b§x§r",
  middleBig: "§m§b§r",
  middleMiddle: "§m§m§r",
  middleSmall: "§m§s§r",
  bottom: "§b§b§r",
  bottomRight: "§b§s§r",
} as const;

export type FlagKey = keyof typeof FLAGS;

// Button visibility binding helper
export const buttonVisibilityBindings = (flag: string) => [
  collectionBinding("#form_button_text"),
  viewBinding(contains("#form_button_text", flag), "#visible"),
];

// Image visibility bindings
export const siblingImageBinding = () => siblingImageVisibilityBinding();
export const conditionalImageBinding = () =>
  viewBinding("(not (#texture = ''))", "#visible", "image");

// Button panel configuration type
export interface ButtonPanelConfig {
  name: string;
  flag: string;
  size?: [number, number];
  sizeImg?: [number, number];
  offsetImg?: [number, number];
  labelOffset?: [number, number];
  fontScale?: number;
  sizeType?: SizeValue;
  orientation?: "horizontal" | "vertical";
}

// Button stack configuration type
export interface ButtonStackConfig {
  name: string;
  panel: string;
  orientation: "horizontal" | "vertical";
  offset: [number, number];
  size?: Size;
}

// Label configuration type
export interface LabelConfig {
  name: string;
  text: string;
  size: [number, number];
  offset: [number, number];
  fontScale: number;
}

// Button textures configuration
export interface ButtonTexturesConfig {
  default: string;
  hover: string;
  pressed: string;
}

const DEFAULT_TEXTURES: ButtonTexturesConfig = {
  default: "textures/ui/gui/rotom_phone/form_btn_background",
  hover: "textures/ui/gui/rotom_phone/form_btn_background_interact",
  pressed: "textures/ui/gui/rotom_phone/form_btn_background_interact",
};

const FORM_TEXTURES: ButtonTexturesConfig = {
  default: "textures/ui/form_btn_background",
  hover: "textures/ui/form_btn_background_interact",
  pressed: "textures/ui/form_btn_background_interact",
};

// Create base button template
export function createButtonTemplate(
  ns: NamespaceBuilder,
  options: {
    useSiblingImageBinding?: boolean;
    textures?: ButtonTexturesConfig;
  } = {}
) {
  const { useSiblingImageBinding = false, textures = DEFAULT_TEXTURES } =
    options;

  ns.addRaw("button", {
    type: "stack_panel",
    orientation: "vertical",
    size: "$size",
    "$size|default": [14, 8],
    "$size_img|default": [8, 8],
    "$offset_img|default": [0, 0],
    "$anchor_value|default": "bottom_middle",
    "$button_font_scale_factor_value|default": 1,
    "$new_ui_label_offset_value|default": [0, 0],
    "$source_property_flag|default": "",
    bindings: useSiblingImageBinding
      ? buttonVisibilityBindings("$flag")
      : [
          collectionBinding("#form_button_text"),
          viewBinding("$source_property_flag", "#visible"),
        ],
    controls: [
      {
        image_panel: {
          type: "panel",
          size: "$size_img",
          bindings: [
            useSiblingImageBinding
              ? siblingImageBinding()
              : conditionalImageBinding(),
          ],
          controls: [
            {
              image: {
                type: "image",
                layer: 99,
                offset: "$offset_img",
                bindings: imageTextureBindings(),
              },
            },
          ],
        },
      },
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          $default_button_texture: textures.default,
          $hover_button_texture: textures.hover,
          $pressed_button_texture: textures.pressed,
          $border_visible: false,
          focus_enabled: false,
          $button_text: "#form_button_text",
          $button_text_binding_type: "collection",
          $button_text_grid_collection_name: "form_buttons",
          $button_text_size: ["100%", "100%"],
          $button_text_max_size: ["100%", "100%"],
          $anchor: "$anchor_value",
          $button_font_scale_factor: "$button_font_scale_factor_value",
          $new_ui_label_offset: "$new_ui_label_offset_value",
          bindings: [collectionDetailsBinding()],
        },
      },
    ],
  });
}

// Process button panels configuration
export function createButtonPanels(
  ns: NamespaceBuilder,
  namespace: string,
  configs: ButtonPanelConfig[]
) {
  const verticalPanels = [
    "left_big",
    "middle_big",
    "middle_middle",
    "bottom_right",
  ];

  configs.forEach(
    ({
      name,
      flag,
      size,
      sizeImg,
      offsetImg,
      labelOffset,
      fontScale,
      sizeType,
      orientation,
    }) => {
      const isVertical =
        orientation === "vertical" ||
        (orientation === undefined &&
          verticalPanels.some((n) => name.includes(n)));
      const width: SizeValue = sizeType || (isVertical ? "100%" : "100%c");
      const height: SizeValue = isVertical ? "100%c" : "100%";

      const panelBuilder = panel(name)
        .size(width, height)
        .rawProp("$flag", flag);

      if (size) panelBuilder.rawProp("$size", size);
      if (sizeImg) panelBuilder.rawProp("$size_img", sizeImg);
      if (offsetImg) panelBuilder.rawProp("$offset_img", offsetImg);
      if (labelOffset)
        panelBuilder.rawProp("$new_ui_label_offset_value", labelOffset);
      if (fontScale)
        panelBuilder.rawProp("$button_font_scale_factor_value", fontScale);

      panelBuilder.controls({
        [`button@${namespace}.button`]: {
          $source_property_flag: contains("#form_button_text", "$flag"),
        },
      });

      panelBuilder.addToNamespace(ns);
    }
  );
}

// Process button stacks configuration
export function createButtonStacks(
  ns: NamespaceBuilder,
  namespace: string,
  configs: ButtonStackConfig[]
) {
  configs.forEach(({ name, panel: panelName, orientation, offset, size }) => {
    stackPanel(name, orientation)
      .rawProp("orientation", orientation)
      .size(size?.[0] ?? "100%c", size?.[1] ?? "20%")
      .offset(...offset)
      .rawProp("factory", {
        name: "buttons",
        control_name: `${namespace}.${panelName}`,
      })
      .rawProp("collection_name", "form_buttons")
      .bindings(...factoryBindings())
      .addToNamespace(ns);
  });
}

// Create a label configuration object
export function createLabel(config: LabelConfig): Record<string, unknown> {
  return {
    [config.name]: {
      type: "label",
      text: config.text,
      size: config.size,
      offset: config.offset,
      font_scale_factor: config.fontScale,
    },
  };
}

// Create the top section (title + label + buttons) - common across all pages
export function createTopSection(namespace: string): Record<string, unknown> {
  return {
    top: {
      type: "panel",
      controls: [
        {
          title: {
            type: "label",
            layer: 99,
            size: [30, 15],
            anchor_from: "top_middle",
            anchor_to: "top_middle",
            offset: [47, "39%"],
            text: "#title_text",
            font_scale_factor: 0.55,
            bindings: [globalBinding("#title_text")],
          },
        },
        {
          label: {
            type: "label",
            layer: 99,
            size: [70, 20],
            anchor_from: "top_middle",
            anchor_to: "top_middle",
            offset: [93, "39.5%"],
            font_scale_factor: 0.8,
            text: "#form_text",
          },
        },
        { [`top_buttons@${namespace}.top_buttons`]: {} },
      ],
    },
  };
}

// Create a simple panel wrapping buttons
export function createButtonWrapper(
  name: string,
  namespace: string,
  buttonsName: string
): Record<string, unknown> {
  return {
    [name]: {
      type: "panel",
      controls: [{ [`${buttonsName}@${namespace}.${buttonsName}`]: {} }],
    },
  };
}

// Create main panel with close button and content
export function createMainPanel(
  namespace: string,
  textureFile: string
): PanelBuilder<"main"> {
  return panel("main").controls(
    {
      "close_button@common.light_close_button": {
        $close_button_offset: [-10, 111],
      },
    },
    {
      content: {
        type: "image",
        texture: `textures/ui/gui/rotom_phone/${textureFile}`,
        // @ts-ignore
        keep_ratio: true,
        controls: [
          { [`button_controller@${namespace}.button_controller`]: {} },
        ],
      },
    }
  );
}

// Export texture configs for pages that need different textures
export { DEFAULT_TEXTURES, FORM_TEXTURES };
