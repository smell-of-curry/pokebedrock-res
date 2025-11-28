/**
 * Battle UI - Progress Bar Elements
 *
 * HP bars, PP bars, and progress-related UI elements.
 */

import {
  element,
  panel,
  image,
  extendRaw,
  collectionBinding,
  viewBinding,
  skip,
  first,
  type ElementBuilder,
  type SizeValue,
  type NamespaceBuilder,
  extend,
} from "mcbe-ts-ui";

import { NS } from "./shared";

/** Base PP bar for move display */
export const ppBar = image("pp_bar", "textures/ui/battle/white_shaded")
  .color([0.1, 0.6, 1])
  .layer(10)
  .anchor("bottom_left")
  .fill()
  .size("40%", "29%")
  .offset("30.3%", "19%")
  .variableDefault("bar", "")
  .bindings(
    collectionBinding("#form_button_texture"),
    viewBinding(`(${skip(2, "#form_button_texture")} = $bar)`, "#visible")
  );

/**
 * Generates PP bar variant elements (0-20 + null)
 * @param ns - The namespace builder to add elements to
 */
export function addPpBarVariants(ns: NamespaceBuilder): void {
  ["null", ...Array.from({ length: 21 }, (_, i) => i)].forEach((i) => {
    const barVal = i === "null" ? "_null" : `_${i}`;
    const sizePercent: SizeValue =
      i === "null" || i === 0
        ? "0%"
        : (`${(Number(i) * 1.965).toFixed(3)}%` as SizeValue);

    ns.add(
      element(String(i))
        .extends(`${NS}.pp_bar`)
        .variable("bar", barVal)
        .size(sizePercent, "29%")
    );
  });
}

// =============================================================================
// HP Progress Bar
// =============================================================================

/** Variable progress bar for HP display */
export const variableProgressBar = image(
  "variable_progress_bar",
  "textures/ui/filled_progress_bar"
)
  .layer(2)
  .clipPixelPerfect(false)
  .clipDirection("left")
  .variableDefault("color_id", "G")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      `( ${first(3, skip(60, "#form_button_text"))} * 1 )`,
      "#clip_ratio"
    ),
    viewBinding(
      `(${first(1, skip(58, "#form_button_text"))} = $color_id)`,
      "#visible"
    )
  );

/** Dynamic progress bar with color variants (green/yellow/red) */
export const dynamicProgressBar = panel("dynamic_progress_bar").controls(
  // Standardize common extensions.
  extendRaw("empty_progress_bar", "common.empty_progress_bar", { layer: 1 }),
  extend("green", variableProgressBar)
    .variable("color_id", "G")
    .color([0.5, 1.0, 0.5, 1.0]),
  extend("yellow", variableProgressBar)
    .variable("color_id", "Y")
    .color([1, 0.9, 0, 1.0]),
  extend("red", variableProgressBar)
    .variable("color_id", "R")
    .color([1, 0, 0, 1.0])
);

/**
 * Helper to add all progress elements to namespace
 */
export function addProgressElements(
  add: (builder: ElementBuilder) => void
): void {
  add(ppBar);
  add(variableProgressBar);
  add(dynamicProgressBar);
}
