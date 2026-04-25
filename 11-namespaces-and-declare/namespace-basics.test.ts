import { describe, it, expect } from "vitest";

/**
 * TypeScript's `namespace` keyword (not JSDoc `@namespace`):
 * groups values at development time and can exist at runtime depending on emit settings.
 * Prefer ES modules in app code; this is the shape you still read in some codebases.
 */
namespace RuntimeDemo {
  export const label = "namespaced";
}

/**
 * A global from `ambient.d.ts` (`declare namespace AmbientPlayground`) is only types,
 * not a value — we construct an object that matches the interface.
 */
const sample: AmbientPlayground.SampleConfig = { apiUrl: "https://example.com" };

describe("namespaces and declare (see README)", () => {
  it("TypeScript `namespace` exports a runtime object in this build", () => {
    expect(RuntimeDemo.label).toBe("namespaced");
  });

  it("Global `declare namespace` types (ambient.d.ts) are visible to the checker", () => {
    expect(sample.apiUrl).toBe("https://example.com");
  });
});
