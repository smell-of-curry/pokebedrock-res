/**
 * Phone HUD Element
 *
 * Displays a rotom phone icon with various animation states:
 * - Ringing: Animated flip-book for incoming calls
 * - Standby: Static standby icon
 * - Loop: Jeb-style animated loop for special states
 */

import {
  defineUI,
  image,
  panel,
  prefix,
  phudPhoneBinding,
  conditionalBindings,
  animation,
  animRef,
} from "mcbe-ts-ui";

export default defineUI(
  "phud_phone",
  (ns) => {
    // =========================================================================
    // Animation Definitions
    // =========================================================================

    // Ringing animation - 11 frame flip book
    ns.addAnimation(
      animation("anim__ringing")
        .flipBook()
        .initialUV(0, 0)
        .frameCount(11)
        .fps(11)
        .frameStep(64)
    );

    // Active animation - 4 frame flip book
    ns.addAnimation(
      animation("anim__active")
        .flipBook()
        .initialUV(0, 0)
        .frameCount(4)
        .fps(4)
        .frameStep(64)
    );

    // Jeb start flip book animation
    ns.addAnimation(
      animation("anim__jeb_start_flipbook")
        .flipBook()
        .initialUV(0, 0)
        .frameCount(12)
        .fps(12)
        .frameStep(64)
    );

    // Jeb start destroy animation - waits then destroys the "start" element
    ns.addAnimation(
      animation("anim__jeb_start_destroy").wait(0.97).destroyAtEnd("start")
    );

    // Jeb loop flip book animation
    ns.addAnimation(
      animation("anim__jeb_loop_flipbook")
        .flipBook()
        .initialUV(0, 0)
        .frameCount(8)
        .fps(12)
        .frameStep(64)
    );

    // Jeb loop show animation - waits then triggers next animation
    ns.addAnimation(
      animation("anim__jeb_loop_show__0")
        .wait(0.97)
        .next(animRef("phud_phone", "anim__jeb_loop_show__1"))
    );

    // Jeb loop show animation - final alpha set
    ns.addAnimation(
      animation("anim__jeb_loop_show__1").alpha(1, 1).duration(0)
    );

    // =========================================================================
    // Abstract Base Element
    // =========================================================================

    // Abstract base for phone conditional elements - reused by multiple elements
    const abstractPhoneConditional = image("abstract_phone_conditional")
      .fullSize()
      .bindings(phudPhoneBinding("#value"), ...conditionalBindings());
    ns.add(abstractPhoneConditional);

    // =========================================================================
    // Icon Templates
    // =========================================================================

    // Icon template extending abstract base (raw needed for dynamic texture expression)
    ns.addRaw("icon@abstract_phone_conditional", {
      texture: "('textures/ui/phud/' + $name)",
    });

    // Jeb icon template (raw needed for dynamic texture expression)
    ns.addRaw("jeb_icon", {
      type: "image",
      texture: "('textures/ui/phud/maple_' + $name))",
      uv_size: [64, 64],
      bindings: [phudPhoneBinding("#value")],
    });

    // Jeb icon wrapper extending abstract base
    ns.addRaw("jeb_icon_wrapper@abstract_phone_conditional", {
      type: "panel",
      size: ["100%", "100%"],
      $condition: prefix(4, "#value", "loop"),
      controls: [
        {
          "start@jeb_icon": {
            uv: animRef("phud_phone", "anim__jeb_start_flipbook"),
            anims: [animRef("phud_phone", "anim__jeb_start_destroy")],
            $name: "start",
          },
        },
        {
          "loop@jeb_icon": {
            uv: animRef("phud_phone", "anim__jeb_loop_flipbook"),
            anims: [animRef("phud_phone", "anim__jeb_loop_show__0")],
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
            uv: animRef("phud_phone", "anim__ringing"),
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
    ns.add(icons);

    // =========================================================================
    // Background Templates
    // =========================================================================

    // Phone background extending abstract base
    ns.addRaw("phone_background@abstract_phone_conditional", {
      texture: "textures/ui/phud/box_small",
      $condition: "((#value = 'ring') or (#value = 'standby')",
    });

    // Jeb background extending abstract base
    ns.addRaw("jeb_background@abstract_phone_conditional", {
      type: "image",
      $condition: prefix(4, "#value", "loop"),
      size: ["100%", "100%"],
      texture: "textures/ui/phud/box_wide",
      alpha: 0,
      anims: [animRef("phud_phone", "anim__jeb_loop_show__0")],
    });

    // Backgrounds panel
    const backgrounds = panel("backgrounds").controls(
      { "phone@phone_background": {} },
      { "jeb_background@jeb_background": {} }
    );
    ns.add(backgrounds);

    // =========================================================================
    // Main Panel
    // =========================================================================

    // Main panel containing icons and backgrounds
    ns.add(
      panel("main").controls(
        { "icons@icons": {} },
        { "backgrounds@backgrounds": {} }
      )
    );
  },
  { subdir: "phud" }
);
