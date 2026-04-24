/**
 * ISP violation: read-only code depends on a fat type with save/delete/audit; tests must
 * implement or no-op what they do not use.
 */
export interface FatProductService {
  allProductNames(): readonly string[];
  addProduct(name: string): void;
  deleteProduct(_id: number): void;
  reindexSearch(): void;
  exportAuditToDisk(_path: string): void;
}

export class MonolithProductService implements FatProductService {
  private names = ["alpha", "beta"];

  allProductNames(): readonly string[] {
    return this.names;
  }
  addProduct(name: string): void {
    this.names = [...this.names, name];
  }
  deleteProduct(_id: number): void {
    this.names = this.names.slice(1);
  }
  reindexSearch(): void {}
  exportAuditToDisk(_path: string): void {}
}

export class ReadonlyDashboardBad {
  constructor(private readonly service: FatProductService) {}

  showNames(): string {
    return this.service.allProductNames().join(", ");
  }
}
