import { Jimp, JimpMime } from "jimp";
import { writeImageIfChanged } from "./utils";
import { Range } from "./types";

/**
 * Represents an item containing images to be fused and the output path.
 */
export interface ImageFuseItem {
  /**
   * The output path for the fused image.
   */
  outputPath: string;
  /**
   * The input image paths to fuse.
   * Url or local file paths.
   */
  imageInputs: string[];
}

// URL to vanilla Minecraft Bedrock textures repository
const vanillaTexturesUrl =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures";

// Define image sets to be fused
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
  {
    outputPath: "textures/ui/icons/oak_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_oak.png`,
      `${vanillaTexturesUrl}/blocks/stripped_oak_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/spruce_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_spruce.png`,
      `${vanillaTexturesUrl}/blocks/stripped_spruce_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/birch_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_birch.png`,
      `${vanillaTexturesUrl}/blocks/stripped_birch_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/jungle_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_jungle.png`,
      `${vanillaTexturesUrl}/blocks/stripped_jungle_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/acacia_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_acacia.png`,
      `${vanillaTexturesUrl}/blocks/stripped_acacia_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/dark_oak_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/log_big_oak.png`,
      `${vanillaTexturesUrl}/blocks/stripped_dark_oak_log.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/mangrove_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/mangrove_log_side.png`,
      `${vanillaTexturesUrl}/blocks/stripped_mangrove_log_side.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/cherry_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/cherry_log_side.png`,
      `${vanillaTexturesUrl}/blocks/stripped_cherry_log_side.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/crimson_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/huge_fungus/crimson_log_side.png`,
      `${vanillaTexturesUrl}/blocks/huge_fungus/stripped_crimson_stem_side.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/warped_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/huge_fungus/warped_stem_side.png`,
      `${vanillaTexturesUrl}/blocks/huge_fungus/stripped_warped_stem_side.png`,
    ],
  },
  {
    outputPath: "textures/ui/icons/pale_oak_logs.png",
    imageInputs: [
      `${vanillaTexturesUrl}/blocks/pale_oak_log_side.png`,
      `${vanillaTexturesUrl}/blocks/stripped_pale_oak_log_side.png`,
    ],
  },
];

/**
 * Fuses images in the specified item and writes to output path
 * @param item ImageFuseItem containing output path and input images
 */
async function fuseItem(item: ImageFuseItem) {
  const imageCount: Range<2, 4> = item.imageInputs.length as Range<2, 4>;

  // Validate image count range
  if (imageCount < 2 || imageCount > 4)
    throw new Error("Please provide 2, 3, or 4 images to fuse");

  // Load all images
  const images = await Promise.all(item.imageInputs.map((p) => Jimp.read(p)));

  // Get the smallest width and height among images
  const w = Math.min(...images.map((img) => img.bitmap.width ?? 0));
  const h = Math.min(...images.map((img) => img.bitmap.height ?? 0));

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
      const angle = Math.atan2(ny - cy, 1 - nx - cx);
      const twoPi = Math.PI * 2;
      const sectorAngle = twoPi / imageCount;
      // Rotate so index 0 is "top"; extra 45° when count==2 to match a diagonal split
      const offset = -Math.PI / 2 - (Number(imageCount === 2) * Math.PI) / 4;
      const angleNorm = (((angle - offset) % twoPi) + twoPi) % twoPi; // normalize to [0, 2π)
      const region = Math.floor(angleNorm / sectorAngle) % imageCount;
      const weights = Array.from({ length: imageCount }, (_, i) =>
        i === region ? 1 : 0
      );

      // Blend pixels from all images
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let i = 0; i < imageCount; i++) {
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
  const didWrite = await writeImageIfChanged(item.outputPath, imageBuffer);
  console.log(didWrite ? "Created:" : "Unchanged:", item.outputPath);
}

(async () => {
  for (const item of Object.values(imageSets)) {
    await fuseItem(item);
  }
})();
