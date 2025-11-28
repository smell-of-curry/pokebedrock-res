import {
  defineUI,
  panel,
  prefix,
  phudPhoneBinding,
  conditionalBindings,
  animation,
  animRef,
  boundImage,
  extend,
  image,
} from "mcbe-ts-ui";

// TODO: We could make this without extending anything.

const animations = [
  animation("anim__ringing")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(11)
    .fps(11)
    .frameStep(64),

  animation("anim__active")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(4)
    .fps(4)
    .frameStep(64),

  animation("anim__jeb_start_flipbook")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(12)
    .fps(12)
    .frameStep(64),

  animation("anim__jeb_start_destroy").wait(0.97).destroyAtEnd("start"),

  animation("anim__jeb_loop_flipbook")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(8)
    .fps(12)
    .frameStep(64),

  animation("anim__jeb_loop_show__0")
    .wait(0.97)
    .next(animRef("phud_phone", "anim__jeb_loop_show__1")),

  animation("anim__jeb_loop_show__1").alpha(1, 1).duration(0),
];

export default defineUI("phud_phone", (ns) => {
  for (const animation of animations) ns.addAnimation(animation);

  // TODO: I want to clean this up to be more like `phudText` so it can read the image binding name.
  const abstractPhoneConditional = boundImage(
    "abstract_phone_conditional",
    "texture"
  ).fullSize();
  abstractPhoneConditional.bindings(
    phudPhoneBinding(`#${abstractPhoneConditional.bindingName}`),
    ...conditionalBindings()
  );
  const abstractPhoneNS = abstractPhoneConditional.addToNamespace(ns);

  const jebIcon = image("jeb_icon", "('textures/ui/phud/maple_' + $name))")
    .uvSize(64, 64)
    .bindings(phudPhoneBinding("#value"))
    .addToNamespace(ns);

  const icon = extend("icon", abstractPhoneNS)
    .texture("('textures/ui/phud/' + $name)")
    .addToNamespace(ns);

  // Jeb icon wrapper extending abstract base
  const jebIconWrapper = extend("jeb_icon_wrapper", abstractPhoneNS)
    .variable("$condition", prefix(4, "#value", "loop"))
    .controls(
      extend("start", jebIcon)
        .uvAnim(animRef("phud_phone", "anim__jeb_start_flipbook"))
        .anims(animRef("phud_phone", "anim__jeb_start_destroy"))
        .variable("$name", "start"),
      extend("loop", jebIcon)
        .uvAnim(animRef("phud_phone", "anim__jeb_loop_flipbook"))
        .anims(animRef("phud_phone", "anim__jeb_loop_show__0"))
        .alpha(0)
        .variable("$name", "loop")
    );

  const icons = panel("icons")
    .layer(1)
    .controls(
      extend("ringing", icon)
        .uvAnim(animRef("phud_phone", "anim__ringing"))
        .uvSize(64, 64)
        .variable("$name", "ringing")
        .variable("$condition", "(#value = 'ring')"),
      extend("standby", icon)
        .variable("$name", "standby")
        .variable("$condition", "(#value = 'standby')"),
      jebIconWrapper
    );

  const backgrounds = panel("backgrounds").controls(
    extend("phone_background", abstractPhoneNS)
      .texture("textures/ui/phud/box_small")
      .variable("$condition", "((#value = 'ring') or (#value = 'standby'))")
  );

  const jebBackground = extend("jeb_background", abstractPhoneNS)
    .texture("textures/ui/phud/box_wide")
    .alpha(0)
    .anims(animRef("phud_phone", "anim__jeb_loop_show__0"))
    .variable("$condition", prefix(4, "#value", "loop"));

  const [, finalNs] = ns.add(
    panel("main")
      .anchor("left_middle")
      .offset(8, 0)
      .size(64, 64)
      .controls(icons, backgrounds, jebBackground)
  );
  return finalNs;
});
