/**
 * Battle UI - Progress Bar Elements
 *
 * HP bars, PP bars, and progress-related UI elements.
 */

import {
  panel,
  image,
  extendRaw,
  collectionBinding,
  viewBinding,
  skip,
  first,
  extend,
  type NamespaceElement,
  type SizeValue,
  ImageBuilder,
  PanelBuilder,
  NamespaceBuilder,
} from "mcbe-ts-ui";

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

// Store registered namespace elements for cross-module access
export interface ProgressElements {
  ppBar: NamespaceElement<ImageBuilder<string>>;
  variableProgressBar: NamespaceElement<ImageBuilder<string>>;
  dynamicProgressBar: NamespaceElement<PanelBuilder<string>>;
}

/**
 * Register all progress elements to namespace and return references
 */
export function registerProgressElements(
  ns: NamespaceBuilder
): ProgressElements {
  const ppBarNs = ppBar.addToNamespace(ns);
  const variableProgressBarNs = variableProgressBar.addToNamespace(ns);

  // Dynamic progress bar with color variants (green/yellow/red)
  const dynamicProgressBarNs = panel("dynamic_progress_bar")
    .controls(
      extendRaw("empty_progress_bar", "common.empty_progress_bar", {
        layer: 1,
      }),
      extend("green", variableProgressBarNs)
        .variable("color_id", "G")
        .color([0.5, 1.0, 0.5, 1.0]),
      extend("yellow", variableProgressBarNs)
        .variable("color_id", "Y")
        .color([1, 0.9, 0, 1.0]),
      extend("red", variableProgressBarNs)
        .variable("color_id", "R")
        .color([1, 0, 0, 1.0])
    )
    .addToNamespace(ns);

  return {
    ppBar: ppBarNs,
    variableProgressBar: variableProgressBarNs,
    dynamicProgressBar: dynamicProgressBarNs,
  };
}

/**
 * Generates PP bar variant elements (0-20 + null)
 * @param ns - The namespace builder to add elements to
 * @param ppBarNs - The registered ppBar namespace element
 */
export function registerPpBarVariants(
  ns: NamespaceBuilder,
  ppBarNs: NamespaceElement
): void {
  ["null", ...Array.from({ length: 21 }, (_, i) => i)].forEach((i) => {
    const barVal = i === "null" ? "_null" : `_${i}`;
    const sizePercent: SizeValue =
      i === "null" || i === 0
        ? "0%"
        : (`${(Number(i) * 1.965).toFixed(3)}%` as SizeValue);

    extend(String(i), ppBarNs)
      .variable("bar", barVal)
      .size(sizePercent, "29%")
      .addToNamespace(ns);
  });
}

/**
 * Get the dynamic progress bar builder for use in other modules.
 * Note: Must be called after registerProgressElements to get the registered version.
 */
export function createDynamicProgressBar(
  variableProgressBarNs: NamespaceElement<ImageBuilder<string>>
) {
  return panel("dynamic_progress_bar").controls(
    extendRaw("empty_progress_bar", "common.empty_progress_bar", { layer: 1 }),
    extend("green", variableProgressBarNs)
      .variable("color_id", "G")
      .color([0.5, 1.0, 0.5, 1.0]),
    extend("yellow", variableProgressBarNs)
      .variable("color_id", "Y")
      .color([1, 0.9, 0, 1.0]),
    extend("red", variableProgressBarNs)
      .variable("color_id", "R")
      .color([1, 0, 0, 1.0])
  );
}
