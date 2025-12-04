import { Jimp, JimpMime } from "jimp";
import { ImageFuseItem } from "./types";
import { writeImageIfChanged } from "./utils";

// URL to vanilla Minecraft Bedrock textures repository
const vanillaTexturesUrl =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures";

// Your array of image sets (2, 3, or 4 images each)
const imageSets: ImageFuseItem[] = [
  {
    outputPath: "textures/ui/icons/coal_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/coal_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_coal_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/copper_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/copper_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_copper_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/iron_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/iron_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_iron_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/gold_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/gold_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_gold_ore.png`,
      `${vanillaTexturesUrl}/blocks/nether_gold_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/diamond_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/diamond_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_diamond_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/emerald_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/emerald_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_emerald_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/lapis_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/lapis_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_lapis_ore.png`
    ]
  },
  {
    outputPath: "textures/ui/icons/redstone_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/redstone_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_redstone_ore.png`
    ]
  }
];

async function fuseItem(item: ImageFuseItem) {
  const count = item.imageInputs.length;

  if (count < 2 || count > 4)
    throw new Error("Please provide 2, 3, or 4 images to fuse");

  // Load all images
  const images = await Promise.all(item.imageInputs.map((p) => Jimp.read(p)));

  // Use first image dimensions as reference
  const w = images[0]?.bitmap.width ?? 0;
  const h = images[0]?.bitmap.height ?? 0;

  // Resize all images to match first image
  for (let i = 1; i < images.length; i++) images[i]?.resize({ w, h });

  const fused = new Jimp({ width: w, height: h });
  const fuzz = 0.02; // adjust for more fuzz (smaller = sharper edge)

  // Loop through all pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Normalized coordinates (0-1)
      const nx = x / w;
      const ny = y / h;

      let weights;

      if (count === 2) {
        // 2 images: diagonal split from top-right to bottom-left
        // Image 0: top-left region, Image 1: bottom-right region
        const diag = nx + ny; // diagonal line where nx + ny = 1
        const dist = Math.abs(diag - 1);

        if (dist < fuzz) {
          const t = 0.5 + (diag - 1) / (2 * fuzz);
          weights = [
            1 - Math.max(0, Math.min(1, t)),
            Math.max(0, Math.min(1, t))
          ];
        } else if (diag < 1) weights = [1, 0];
        else weights = [0, 1];
      } else if (count === 3) {
        // 3 images: Y-shape from center
        // Lines go from center (0.5, 0.5) to: top (0.5, 0), bottom-left (0, 1), bottom-right (1, 1)
        // Image 0: top region, Image 1: bottom-left, Image 2: bottom-right
        const cx = 0.5,
          cy = 0.5;

        // Calculate angle from center
        const angle = Math.atan2(ny - cy, nx - cx);

        // Define region boundaries (angles in radians)
        // Top: around -PI/2 (pointing up)
        // Bottom-left: around 3*PI/4 (pointing down-left)
        // Bottom-right: around PI/4 (pointing down-right)

        // Dividing lines at angles: -PI/6 (30° from top toward right), -5*PI/6 (toward left), PI/2 (straight down)
        const angle1 = -Math.PI / 6; // boundary between top and bottom-right
        const angle2 = Math.PI / 2; // boundary between bottom-right and bottom-left
        const angle3 = (-5 * Math.PI) / 6; // boundary between bottom-left and top

        let region;
        if (angle >= angle3 && angle < angle1) region = 0; // top
        else if (angle >= angle1 && angle < angle2) region = 2; // bottom-right
        else region = 1; // bottom-left

        weights = [0, 0, 0];
        weights[region] = 1;
      } else if (count === 4) {
        // 4 images: X-shape dividing into 4 triangular regions
        // Diagonals cross at center (0.5, 0.5)
        // Image 0: top, Image 1: right, Image 2: bottom, Image 3: left
        const cx = 0.5,
          cy = 0.5;

        // Calculate angle from center
        const angle = Math.atan2(ny - cy, nx - cx);

        // 4 regions divided by X (diagonals at 45° angles)
        // Top: -3PI/4 to -PI/4
        // Right: -PI/4 to PI/4
        // Bottom: PI/4 to 3PI/4
        // Left: 3PI/4 to PI and -PI to -3PI/4

        let region;
        if (angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4) {
          region = 0; // top
        } else if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
          region = 1; // right
        } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
          region = 2; // bottom
        } else {
          region = 3; // left
        }

        weights = [0, 0, 0, 0];
        weights[region] = 1;
      }

      // Blend pixels from all images
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let i = 0; i < count; i++) {
        r += images[i]?.bitmap.data[idx + 0]! * weights[i];
        g += images[i]?.bitmap.data[idx + 1]! * weights[i];
        b += images[i]?.bitmap.data[idx + 2]! * weights[i];
        a += images[i]?.bitmap.data[idx + 3]! * weights[i];
      }

      fused.bitmap.data[idx + 0] = r;
      fused.bitmap.data[idx + 1] = g;
      fused.bitmap.data[idx + 2] = b;
      fused.bitmap.data[idx + 3] = a;
    }
  }

  const imageBuffer = await fused.getBuffer(JimpMime.png);
  writeImageIfChanged(item.outputPath, imageBuffer);
  console.log("Created:", item.outputPath);
}

(async () => {
  for (const key in imageSets) {
    const item = imageSets[key];
    if (!item) continue;
    await fuseItem(item);
  }
})();
