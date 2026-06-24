import { compileCombinedAssets } from "../compileCombinedAssets";
import { REQUIRED_FORMAT_VERSIONS } from "../validateFormatVersions";

describe("compileCombinedAssets", () => {
  let result: ReturnType<typeof compileCombinedAssets>;

  beforeAll(() => {
    result = compileCombinedAssets();
  });

  it("should produce combined animation file", () => {
    const entry = result.generatedEntries.find(
      (e) => e.archivePath === "animations/pokebedrock_animations.json",
    );
    expect(entry).toBeDefined();
    const data = JSON.parse(entry!.content);
    expect(data.format_version).toBe(REQUIRED_FORMAT_VERSIONS.animations);
    expect(typeof data.animations).toBe("object");
    expect(Object.keys(data.animations).length).toBeGreaterThan(0);
  });

  it("should produce combined animation_controllers file", () => {
    const entry = result.generatedEntries.find(
      (e) =>
        e.archivePath ===
        "animation_controllers/pokebedrock_animation_controllers.json",
    );
    expect(entry).toBeDefined();
    const data = JSON.parse(entry!.content);
    expect(data.format_version).toBe(
      REQUIRED_FORMAT_VERSIONS.animation_controllers,
    );
    expect(typeof data.animation_controllers).toBe("object");
    expect(Object.keys(data.animation_controllers).length).toBeGreaterThan(0);
  });

  it("should produce combined render_controllers file", () => {
    const entry = result.generatedEntries.find(
      (e) =>
        e.archivePath ===
        "render_controllers/pokebedrock_render_controllers.json",
    );
    expect(entry).toBeDefined();
    const data = JSON.parse(entry!.content);
    expect(data.format_version).toBe(REQUIRED_FORMAT_VERSIONS.render_controllers);
    expect(typeof data.render_controllers).toBe("object");
    expect(Object.keys(data.render_controllers).length).toBeGreaterThan(0);
  });

  it("should produce combined geometry file", () => {
    const entry = result.generatedEntries.find(
      (e) => e.archivePath === "models/entity/pokebedrock_models.geo.json",
    );
    expect(entry).toBeDefined();
    const data = JSON.parse(entry!.content);
    expect(data.format_version).toBe(REQUIRED_FORMAT_VERSIONS.geometry);
    expect(Array.isArray(data["minecraft:geometry"])).toBe(true);
    expect(data["minecraft:geometry"].length).toBeGreaterThan(0);
  });

  it("should not bundle materials", () => {
    const combinedMaterials = result.generatedEntries.find((e) =>
      e.archivePath.endsWith(".material"),
    );
    expect(combinedMaterials).toBeUndefined();
    for (const p of result.skipPaths) {
      expect(p.endsWith(".material")).toBe(false);
    }
  });

  it("should skip all original files that were combined", () => {
    expect(result.skipPaths.size).toBeGreaterThan(0);
    for (const p of result.skipPaths) {
      expect(typeof p).toBe("string");
      expect(p).not.toContain("\\");
    }
  });

  it("should sort animation keys alphabetically in combined output", () => {
    const entry = result.generatedEntries.find(
      (e) => e.archivePath === "animations/pokebedrock_animations.json",
    );
    if (!entry) return;
    const data = JSON.parse(entry.content);
    const keys = Object.keys(data.animations);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it("should sort geometry entries by identifier in combined output", () => {
    const entry = result.generatedEntries.find(
      (e) => e.archivePath === "models/entity/pokebedrock_models.geo.json",
    );
    if (!entry) return;
    const data = JSON.parse(entry.content);
    const ids: string[] = data["minecraft:geometry"].map(
      (g: { description: { identifier: string } }) => g.description.identifier,
    );
    const sorted = [...ids].sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return a < b ? -1 : 1;
    });
    expect(ids).toEqual(sorted);
  });
});
