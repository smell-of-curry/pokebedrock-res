import { KEY_VALUE_CATEGORIES } from "../compileCombinedAssets";

export type CompileExceptionCategory = (typeof KEY_VALUE_CATEGORIES)[number] | "models";

/**
 * Keys listed here will NOT be merged into the combined output file.
 * Instead, they will remain in their original source files (filtered to only
 * contain the excepted keys). This is useful for assets that must stay
 * isolated for debugging, hot-swapping, or Marketplace requirements.
 *
 * Each array contains the **identifier / key** used inside the JSON:
 *  - animations:             e.g. "animation.mew.walking"
 *  - animation_controllers:  e.g. "controller.animation.pokemon.clodsire"
 *  - render_controllers:     e.g. "controller.render.pokemon:aipom"
 *  - models:                 geometry identifier, e.g. "geometry.mew"
 *  - materials:              material ID (not "version"), e.g. "custom_animated:entity_emissive_alpha"
 */
export const COMPILE_EXCEPTIONS = {
  animations: [],
  animation_controllers: [],
  render_controllers: [],
  models: [],
  materials: [],
} as const satisfies Record<CompileExceptionCategory, string[]>;


