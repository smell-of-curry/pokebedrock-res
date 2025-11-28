/**
 * Rotom Phone Second Page UI
 *
 * Second page of the Rotom Phone interface - includes experience points display.
 */

import { defineUI } from "mcbe-ts-ui";
import {
  FLAGS,
  FORM_TEXTURES,
  createButtonTemplate,
  createButtonPanels,
  createButtonStacks,
  createTopSection,
  createButtonWrapper,
  createLabel,
  createMainPanel,
  type ButtonPanelConfig,
  type ButtonStackConfig,
} from "./shared";

const NAMESPACE = "rotom_phone_second";

const buttonPanels: ButtonPanelConfig[] = [
  {
    name: "image_button_panel",
    flag: FLAGS.image,
    size: [21, 8],
    sizeImg: [50, 50],
    offsetImg: [15, -11],
  },
  { name: "top_button_panel", flag: FLAGS.top },
  {
    name: "left_big_button_panel",
    flag: FLAGS.leftBig,
    size: [100, 22.5],
    offsetImg: [0, 15],
    labelOffset: [-15, 0],
    fontScale: 0.7,
  },
  {
    name: "middle_big_button_panel",
    flag: FLAGS.middleBig,
    size: [50, 20],
    labelOffset: [5, -3],
    fontScale: 0.6,
  },
  {
    name: "middle_middle_button_panel",
    flag: FLAGS.middleMiddle,
    size: [50, 20],
    labelOffset: [5, -3],
    fontScale: 0.6,
  },
  {
    name: "middle_small_button_panel",
    flag: FLAGS.middleSmall,
    size: [21, 8],
    sizeImg: [16, 16],
    offsetImg: [0, -2],
  },
  { name: "bottom_buttons_panel", flag: FLAGS.bottom, size: [20, 22] },
  {
    name: "bottom_right_button_panel",
    flag: FLAGS.bottomRight,
    size: [25, 17],
    fontScale: 0.5,
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
    offset: [-55, 26],
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
    name: "middle_middle_buttons",
    panel: "middle_middle_button_panel",
    orientation: "vertical",
    offset: [-20, 50],
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
  createButtonTemplate(ns, { textures: FORM_TEXTURES });
  createButtonPanels(ns, NAMESPACE, buttonPanels);
  createButtonStacks(ns, NAMESPACE, buttonStacks);

  ns.addRaw("button_controller", {
    type: "panel",
    controls: [
      createButtonWrapper("image", NAMESPACE, "image_button"),
      {
        left_big: {
          type: "panel",
          controls: [
            createLabel({
              name: "value1",
              text: "§fValue 1",
              size: [50, 20],
              offset: [-68, -27],
              fontScale: 0.55,
            }),
            createLabel({
              name: "exp_label",
              text: "§fExp. Points:",
              size: [50, 20],
              offset: [-71, -17],
              fontScale: 0.7,
            }),
            createLabel({
              name: "value2",
              text: "§fValue 2",
              size: [50, 20],
              offset: [-62, 8],
              fontScale: 0.55,
            }),
            createLabel({
              name: "value3",
              text: "§fValue 3",
              size: [50, 20],
              offset: [-62, 30],
              fontScale: 0.55,
            }),
            createLabel({
              name: "value4",
              text: "§fValue 4",
              size: [50, 20],
              offset: [-60, 53],
              fontScale: 0.55,
            }),
            { [`left_big_buttons@${NAMESPACE}.left_big_buttons`]: {} },
          ],
        },
      },
      createButtonWrapper("bottom", NAMESPACE, "bottom_buttons"),
      createButtonWrapper("bottom_right", NAMESPACE, "bottom_right_buttons"),
      {
        middle_big: {
          type: "panel",
          controls: [
            createLabel({
              name: "nickname",
              text: "§fNickname",
              size: [50, 20],
              offset: [40, -12],
              fontScale: 0.65,
            }),
            createLabel({
              name: "trainer",
              text: "§fOriginal Trainer",
              size: [60, 20],
              offset: [39, 10],
              fontScale: 0.55,
            }),
            { [`middle_big_buttons@${NAMESPACE}.middle_big_buttons`]: {} },
          ],
        },
      },
      {
        middle_middle: {
          type: "panel",
          controls: [
            createLabel({
              name: "value7",
              text: "§fValue 7",
              size: [50, 20],
              offset: [-7, 30],
              fontScale: 0.65,
            }),
            createLabel({
              name: "value8",
              text: "§fValue 8",
              size: [50, 20],
              offset: [-5, 52],
              fontScale: 0.65,
            }),
            {
              [`middle_middle_buttons@${NAMESPACE}.middle_middle_buttons`]: {},
            },
          ],
        },
      },
      createButtonWrapper("middle_small", NAMESPACE, "middle_small_buttons"),
      createTopSection(NAMESPACE),
    ],
  });

  const [, finalNs] = ns.add(createMainPanel(NAMESPACE, "second"));
  return finalNs;
});
