/**
 * Phone HUD Element
 *
 * Displays a rotom phone icon with various animation states:
 * - Ringing: Animated flip-book for incoming calls
 * - Standby: Static standby icon
 * - Loop: Jeb-style animated loop for special states
 */

import { defineUI, image, panel } from "mcbe-ts-ui";
import { prefix } from "./_string_parser";

export default defineUI(
  "phud_phone",
  (ns) => {
    // Abstract base for phone conditional elements
    const abstractPhoneConditional = image("abstract_phone_conditional")
      .fullSize()
      .bindings(
        {
          binding_name: "#null",
          binding_type: "view",
          source_control_name: "elements",
          source_property_name: "#phone",
          target_property_name: "#value",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name: "$condition",
          target_property_name: "#visible",
        },
        {
          binding_name: "#null",
          binding_type: "view",
          source_property_name: "$condition",
          target_property_name: "#enabled",
        }
      );

    // Ringing animation - flip-book
    ns.addRaw("anim__ringing", {
      anim_type: "flip_book",
      initial_uv: [0, 0],
      frame_count: 11,
      fps: 11,
      frame_step: 64,
    });

    // Active animation - flip-book
    ns.addRaw("anim__active", {
      anim_type: "flip_book",
      initial_uv: [0, 0],
      frame_count: 4,
      fps: 4,
      frame_step: 64,
    });

    // Jeb start animation - flip-book
    ns.addRaw("anim__jeb_start_flipbook", {
      anim_type: "flip_book",
      initial_uv: [0, 0],
      frame_count: 12,
      fps: 12,
      frame_step: 64,
    });

    // Jeb start destroy animation
    ns.addRaw("anim__jeb_start_destroy", {
      anim_type: "wait",
      duration: 0.97,
      destroy_at_end: "start",
    });

    // Jeb loop animation - flip-book
    ns.addRaw("anim__jeb_loop_flipbook", {
      anim_type: "flip_book",
      initial_uv: [0, 0],
      frame_count: 8,
      fps: 12,
      frame_step: 64,
    });

    // Jeb loop show animations
    ns.addRaw("anim__jeb_loop_show__0", {
      anim_type: "wait",
      duration: 0.97,
      next: "@phud_phone.anim__jeb_loop_show__1",
    });

    ns.addRaw("anim__jeb_loop_show__1", {
      anim_type: "alpha",
      duration: 0,
      from: 1,
      to: 1,
    });

    // Icon template - conditional phone icon
    ns.addRaw("icon@abstract_phone_conditional", {
      texture: "('textures/ui/phud/' + $name)",
    });

    // Jeb icon - special animated icon
    ns.addRaw("jeb_icon", {
      type: "image",
      texture: "('textures/ui/phud/maple_' + $name))",
      uv_size: [64, 64],
      bindings: [
        {
          binding_name: "#null",
          binding_type: "view",
          source_control_name: "elements",
          source_property_name: "#phone",
          target_property_name: "#value",
        },
      ],
    });

    // Jeb icon wrapper - contains start and loop animations
    ns.addRaw("jeb_icon_wrapper@abstract_phone_conditional", {
      type: "panel",
      size: ["100%", "100%"],
      $condition: prefix(4, "#value", "loop"),
      controls: [
        {
          "start@jeb_icon": {
            uv: "@phud_phone.anim__jeb_start_flipbook",
            anims: ["@phud_phone.anim__jeb_start_destroy"],
            $name: "start",
          },
        },
        {
          "loop@jeb_icon": {
            uv: "@phud_phone.anim__jeb_loop_flipbook",
            anims: ["@phud_phone.anim__jeb_loop_show__0"],
            alpha: 0,
            $name: "loop",
          },
        },
      ],
    });

    // Icons panel - contains all icon variants
    const icons = panel("icons")
      .layer(1)
      .controls(
        {
          "ringing@icon": {
            $condition: "(#value = 'ring')",
            $name: "ringing",
            uv: "@phud_phone.anim__ringing",
            uv_size: [64, 64],
          },
        },
        {
          "standby@icon": {
            $condition: "(#value = 'standby')",
            $name: "standby",
          },
        },
        { "jeb_icon_wrapper@jeb_icon_wrapper": {} }
      );

    // Phone background - visible for ring/standby states
    ns.addRaw("phone_background@abstract_phone_conditional", {
      texture: "textures/ui/phud/box_small",
      $condition: "((#value = 'ring') or (#value = 'standby')",
    });

    // Jeb background - visible for loop states with fade-in
    ns.addRaw("jeb_background@abstract_phone_conditional", {
      type: "image",
      $condition: prefix(4, "#value", "loop"),
      size: ["100%", "100%"],
      texture: "textures/ui/phud/box_wide",
      alpha: 0,
      anims: ["@phud_phone.anim__jeb_loop_show__0"],
    });

    // Backgrounds panel
    const backgrounds = panel("backgrounds").controls(
      { "phone@phone_background": {} },
      { "jeb_background@jeb_background": {} }
    );

    // Add the abstract base
    ns.add(abstractPhoneConditional);

    // Add icons panel
    ns.add(icons);

    // Add backgrounds panel
    ns.add(backgrounds);

    // Main panel containing icons and backgrounds
    ns.add(panel("main").controls({ "icons@icons": {} }, { "backgrounds@backgrounds": {} }));
  },
  { subdir: "phud" }
);

