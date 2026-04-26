/**
 * LSP violation: callers of readAllLines expect an iterable; one implementation
 * throws on a path the others handle — you cannot pass `ExplodingTextSource` where `InMemory` works.
 */
export interface TextSource {
  readAllLines(_path: string): Iterable<string>;
}

export class InMemoryTextSource implements TextSource {
  readAllLines(): Iterable<string> {
    return ["in-memory line"];
  }
}

export class ExplodingTextSource implements TextSource {
  readAllLines(): Iterable<string> {
    throw new Error("not a safe drop-in for other TextSource implementations");
  }
}

export function printAll(source: TextSource, path: string): string[] {
  const out: string[] = [];
  for (const line of source.readAllLines(path)) {
    out.push(line);
  }
  return out;
}
