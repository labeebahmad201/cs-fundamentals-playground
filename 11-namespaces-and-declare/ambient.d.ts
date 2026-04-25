/**
 * Minimal example of `declare namespace` in a **script** declaration file.
 * No `import` / `export` at top level, so this augments the global scope
 * and makes `AmbientPlayground` a global namespace for types in this project.
 * (In applications you usually keep globals small; this is for learning only.)
 */
declare namespace AmbientPlayground {
  interface SampleConfig {
    apiUrl: string;
  }
}
