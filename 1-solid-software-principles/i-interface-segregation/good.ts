/**
 * Read-only code depends on `ProductQuery` only; write paths use `ProductCommand`. Same
 * concrete class can implement both, but call sites are not forced to see unused methods.
 */

export interface ProductQuery {
  allProductNames(): readonly string[];
}

export interface ProductCommand {
  add(name: string): void;
  deleteById(id: number): void;
  reindexSearch(): void;
  exportAuditToDisk(path: string): void;
}

export class ProductService implements ProductQuery, ProductCommand {
  private items = ["alpha", "beta"];

  allProductNames(): readonly string[] {
    return this.items;
  }
  add(name: string): void {
    this.items = [...this.items, name];
  }
  deleteById(_id: number): void {
    this.items = this.items.slice(1);
  }
  reindexSearch(): void {}
  exportAuditToDisk(_path: string): void {}
}

export class ReadonlyReport {
  constructor(private readonly query: ProductQuery) {}

  showNames(): string {
    return this.query.allProductNames().join(", ");
  }
}
