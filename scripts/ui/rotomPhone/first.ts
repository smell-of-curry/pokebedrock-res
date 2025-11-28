/**
 * Rotom Phone First Page UI
 *
 * First page of the Rotom Phone interface with various button groups.
 */

import { defineUI } from "mcbe-ts-ui";
import {
  FLAGS,
  createButtonTemplate,
  createButtonPanels,
  createButtonStacks,
  createTopSection,
  createButtonWrapper,
  createMainPanel,
  type ButtonPanelConfig,
  type ButtonStackConfig,
} from "./shared";

const NAMESPACE = "rotom_phone_first";

const buttonPanels: ButtonPanelConfig[] = [
  {
    name: "image_button_panel",
    flag: FLAGS.image,
    size: [21, 8],
    sizeImg: [50, 50],
    offsetImg: [15, -11],
    sizeType: "100%c",
    orientation: "horizontal",
  },
  {
    name: "top_button_panel",
    flag: FLAGS.top,
    sizeType: "100%c",
    orientation: "horizontal",
  },
  {
    name: "left_big_button_panel",
    flag: FLAGS.leftBig,
    size: [100, 24],
    offsetImg: [0, 10],
    labelOffset: [-10, 0],
    sizeType: "100%",
    orientation: "vertical",
  },
  {
    name: "left_big_image_button_panel",
    flag: FLAGS.leftBigImage,
    size: [100, 24],
    offsetImg: [0, 10],
    sizeType: "100%",
    orientation: "vertical",
  },
  {
    name: "middle_big_button_panel",
    flag: FLAGS.middleBig,
    size: [50, 20],
    labelOffset: [5, -3],
    fontScale: 0.6,
    sizeType: "100%",
    orientation: "vertical",
  },
  {
    name: "middle_small_button_panel",
    flag: FLAGS.middleSmall,
    size: [21, 8],
    sizeImg: [16, 16],
    offsetImg: [0, -2],
    sizeType: "100%c",
    orientation: "horizontal",
  },
  {
    name: "bottom_buttons_panel",
    flag: FLAGS.bottom,
    size: [20, 22],
    sizeType: "100%c",
    orientation: "horizontal",
  },
  {
    name: "bottom_right_button_panel",
    flag: FLAGS.bottomRight,
    size: [25, 17],
    fontScale: 0.5,
    sizeType: "100%",
    orientation: "vertical",
  },
];

const buttonStacks: ButtonStackConfig[] = [
  {
    name: "image_button",
    panel: "image_button_panel",
    orientation: "horizontal",
    offset: [65, 5],
  },
  {
    name: "top_buttons",
    panel: "top_button_panel",
    orientation: "horizontal",
    offset: [113, -27],
  },
  {
    name: "left_big_buttons",
    panel: "left_big_button_panel",
    orientation: "vertical",
    offset: [-35, 5],
    size: ["20%", "100%c"],
  },
  {
    name: "left_big_image_buttons",
    panel: "left_big_image_button_panel",
    orientation: "vertical",
    offset: [38, 11],
    size: ["20%", "100%c"],
  },
  {
    name: "middle_big_buttons",
    panel: "middle_big_button_panel",
    orientation: "vertical",
    offset: [25, 10],
    size: ["20%", "100%c"],
  },
  {
    name: "middle_small_buttons",
    panel: "middle_small_button_panel",
    orientation: "horizontal",
    offset: [40, 30],
  },
  {
    name: "bottom_buttons",
    panel: "bottom_buttons_panel",
    orientation: "horizontal",
    offset: [-40, 70],
  },
  {
    name: "bottom_right_buttons",
    panel: "bottom_right_button_panel",
    orientation: "vertical",
    offset: [46, 67],
    size: ["20%", "100%c"],
  },
];

export default defineUI(NAMESPACE, (ns) => {
  createButtonTemplate(ns, { useSiblingImageBinding: true });
  createButtonPanels(ns, NAMESPACE, buttonPanels);
  createButtonStacks(ns, NAMESPACE, buttonStacks);

  ns.addRaw("button_controller", {
    type: "panel",
    controls: [
      createButtonWrapper("image", NAMESPACE, "image_button"),
      createButtonWrapper("left_big", NAMESPACE, "left_big_buttons"),
      createButtonWrapper(
        "left_big_image",
        NAMESPACE,
        "left_big_image_buttons"
      ),
      createButtonWrapper("bottom", NAMESPACE, "bottom_buttons"),
      createButtonWrapper("bottom_right", NAMESPACE, "bottom_right_buttons"),
      {
        middle_big: {
          type: "panel",
          controls: [
            {
              nickname: {
                type: "label",
                text: "§fNickname",
                size: [50, 20],
                offset: [33, -12],
                font_scale_factor: 0.65,
              },
            },
            {
              trainer: {
                type: "label",
                text: "§fOriginal Trainer",
                size: [60, 20],
                offset: [39, 10],
                font_scale_factor: 0.55,
              },
            },
            { [`middle_big_buttons@${NAMESPACE}.middle_big_buttons`]: {} },
          ],
        },
      },
      createButtonWrapper("middle_small", NAMESPACE, "middle_small_buttons"),
      createTopSection(NAMESPACE),
    ],
  });

  const [, finalNs] = ns.add(createMainPanel(NAMESPACE, "first"));
  return finalNs;
});
