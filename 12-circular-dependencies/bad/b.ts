import { valueFromA } from "./a.js";

// This executes while A may still be initializing.
if (valueFromA == null) {
  throw new Error("Circular dependency: valueFromA not initialized yet");
}

export const valueFromB = `b sees ${valueFromA}`;
