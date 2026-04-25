import { valueFromB } from "./b.js";

export const valueFromA = "A";

// Top-level read of an import from B contributes to cycle fragility.
export const summaryFromA = `a sees ${valueFromB}`;
