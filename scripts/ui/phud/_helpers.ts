/**
 * PHUD Helper Functions
 *
 * Common utilities for PHUD UI elements.
 */

import type { Binding, LabelBuilder } from "mcbe-ts-ui";
import { notEmpty, strip } from "./_string_parser";

// Re-export string parser utilities for convenience
export * from "./_string_parser";

/**
 * Creates standard PHUD visibility bindings.
 *
 * This is a common pattern in PHUD elements that:
 * 1. Fetches a property value from the "elements" sibling control
 * 2. Shows the element only when the property is not empty
 * 3. Enables the element only when the property is not empty
 *
 * @param propertyName - The property name to bind (e.g., "#fake_actionbar")
 * @returns Array of bindings for visibility control
 *
 * @example
 * ```typescript
 * panel("main")
 *   .bindings(...phudVisibility("#fake_actionbar"))
 * ```
 */
export function phudVisibility(propertyName: string): Binding[] {
  const visibilityExpr = notEmpty(propertyName);
  return [
    {
      binding_name: "#null",
      binding_type: "view",
      source_control_name: "elements",
      source_property_name: propertyName,
      target_property_name: propertyName,
    },
    {
      binding_name: "#null",
      binding_type: "view",
      source_property_name: visibilityExpr,
      target_property_name: "#visible",
    },
    {
      binding_name: "#null",
      binding_type: "view",
      source_property_name: visibilityExpr,
      target_property_name: "#enabled",
    },
  ];
}

/**
 * Creates a binding that reads from the "elements" control.
 *
 * @param sourceProperty - The source property on elements
 * @param targetProperty - The target property on this element
 * @param transform - Optional transformation expression (wraps sourceProperty)
 * @returns A single binding object
 *
 * @example Simple read
 * ```typescript
 * label("text")
 *   .bindings(phudRead("#player_ping_text", "#text", "(${prop} - '_')"))
 * ```
 */
export function phudRead(
  sourceProperty: string,
  targetProperty: string,
  transform?: string
): Binding {
  const sourceExpr = transform
    ? transform.replace("${prop}", sourceProperty)
    : sourceProperty;

  return {
    binding_name: "#null",
    binding_type: "view",
    source_control_name: "elements",
    source_property_name: sourceExpr,
    target_property_name: targetProperty,
  };
}

/**
 * Creates a text binding that strips the trailing underscore.
 *
 * Common pattern: `(#property - '_')` to remove separator.
 *
 * @param propertyName - The property to read
 * @returns Binding that outputs to #text with underscore stripped
 *
 * @example
 * ```typescript
 * label("display")
 *   .text("#text")
 *   .bindings(phudTextBinding("#fake_actionbar"))
 * ```
 */
export function phudTextBinding(propertyName: string): Binding {
  return phudRead(propertyName, "#text", strip("${prop}"));
}

/**
 * Configures a label to display PHUD text from a binding property.
 *
 * This is a shorthand that:
 * 1. Sets `.text("#text")` to use the bound value
 * 2. Adds the binding to fetch and strip underscore from the property
 *
 * @param labelBuilder - The label builder to configure
 * @param propertyName - The PHUD property to bind (e.g., "#fake_actionbar")
 * @returns The label builder for chaining
 *
 * @example
 * ```typescript
 * // Instead of:
 * label("display")
 *   .text("#text")
 *   .bindings(phudTextBinding("#player_ping_text"))
 *
 * // Use:
 * phudText(
 *   label("display"),
 *   "#player_ping_text"
 * )
 * ```
 */
export function phudText(
  labelBuilder: LabelBuilder,
  propertyName: string
): LabelBuilder {
  return labelBuilder.text("#text").bindings(phudTextBinding(propertyName));
}
