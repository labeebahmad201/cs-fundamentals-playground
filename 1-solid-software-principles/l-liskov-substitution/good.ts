/**
 * Substitutes honor the same contract: given a path, iteration yields lines without
 * surprise. If a source can fail, prefer Result/Either or a narrower interface — do not
 * throw where siblings succeed in normal use.
 */
export interface LineSource {
  readAllLines(_path: string): Iterable<string>;
}

export class InMemoryLines implements LineSource {
  constructor(private readonly lines: string[]) {}
  *readAllLines(): IterableIterator<string> {
    yield* this.lines;
  }
}

export class PrefixedFileLines implements LineSource {
  constructor(private readonly prefix: string) {}
  *readAllLines(_path: string): IterableIterator<string> {
    yield `${this.prefix}: a`;
    yield `${this.prefix}: b`;
  }
}

export function printAllGood(source: LineSource, path: string): string[] {
  return [...source.readAllLines(path)];
}
