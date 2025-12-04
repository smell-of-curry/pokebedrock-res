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
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_coal_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/copper_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/copper_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_copper_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/iron_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/iron_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_iron_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/gold_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/gold_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_gold_ore.png`,
      `${vanillaTexturesUrl}/blocks/nether_gold_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/diamond_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/diamond_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_diamond_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/emerald_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/emerald_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_emerald_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/lapis_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/lapis_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_lapis_ore.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/redstone_ores.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/redstone_ore.png`,
      `${vanillaTexturesUrl}/blocks/deepslate/deepslate_redstone_ore.png`,
    ],
  },
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

  // Loop through all pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Normalized coordinates (0-1)
      const nx = x / w;
      const ny = y / h;

      // Dynamic, branchless sector selection (2–N images)
      // - Compute angle from center
      // - Partition circle into equal sectors
      // - Optional rotation so 4→X shape and 2→diagonal split are aligned
      const cx = 0.5,
        cy = 0.5;
      const angle = Math.atan2(ny - cy, nx - cx);
      const twoPi = Math.PI * 2;
      const sectorAngle = twoPi / count;
      // Rotate so index 0 is "top"; extra 45° when count==2 to match a diagonal split
      const offset = -Math.PI / 2 - (Number(count === 2) * Math.PI) / 4;
      const angleNorm = (((angle - offset) % twoPi) + twoPi) % twoPi; // normalize to [0, 2π)
      const region = Math.floor(angleNorm / sectorAngle) % count;
      const weights = Array.from({ length: count }, (_, i) =>
        i === region ? 1 : 0
      );

      // Blend pixels from all images
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let i = 0; i < count; i++) {
        const data = images[i]!.bitmap.data;
        const wgt = weights[i] ?? 0;
        const d0 = data[idx + 0] ?? 0;
        const d1 = data[idx + 1] ?? 0;
        const d2 = data[idx + 2] ?? 0;
        const d3 = data[idx + 3] ?? 0;
        r += d0 * wgt;
        g += d1 * wgt;
        b += d2 * wgt;
        a += d3 * wgt;
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
