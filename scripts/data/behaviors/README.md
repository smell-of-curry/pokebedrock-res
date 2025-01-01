# Pokemon Movement Behaviors

The **objective** of this folder is to make the **cleanest** map of Pokemon to there respected behavior in minecraft bedrock.

## The Problem:

Currently the way pokemon act is sometimes super difficult to replicate in minecraft. For example the movement, flying, speed ect. all require
specific editing to fine tune the correct values. This data will be a sort of Minecraft Bedrock Component based map, describing sleep,
movement speeds, napping behaviors etc.

Currently all the behavior data is being sourced from [here](https://gitlab.com/cable-mc/cobblemon/-/tree/main/common/src/main/resources/data/cobblemon/species?ref_type=heads). It's Cobblemon's species data that specifies hit boxes, behaviors, moves, etc. Although it is useful it is fairly inaccurate to Minecraft Bedrock in movement terms, and we fetch all of the rest of that data from Pokemon Showdown, so we have no need to store it our selfs.

So if we can create our own list it will map the addon better, and look a lot better.

## So How will it be formatted?

Currently we need a map of the following data for every pokemon:
    - How Does it Move?
        - Walk
        - Fly
            - How fast?
            - Can it land on trees?
            - XZ Distance?
            - Y Distance?
        - Swim
            - Can it breath underwater?
            - Lava?
        - Head Movement
        - Can it teleport?
        - ...
    - How does it navigate?
        - Does it avoide damaging blocks?
        - Avoid portals?
        - Avoid the sun?
        - Avoid Water?
        - Avoid Land?
        - Can breach water like dolphin?
        - Can break doors?
        - Can jump?
        - Can open doors?
        - Can path from air
        - Can path over water/lava
        - Can sink?
        - Can walk in lava?
        - Is it amphibious?
    - Breathable?
        - Does it breathe air?
        - Lava?
        - Water?
        - In solids?
        - Does it generate bubbles in water?
        - How long does it take it to inhale
        - How ling can it hold its breath?
    - Does it rest?
        - Can it sleep?
        - Speed on Bed (like a cat)?
        - What light level?
        - What time?
        - ...
    - Is it shoulder mountable?
    - Can you ride it?
        - Can you ride it in the water
        - on land?
        - In the air?
    - Whats its hit box?
