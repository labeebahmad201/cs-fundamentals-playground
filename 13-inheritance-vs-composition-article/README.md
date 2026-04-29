# Inheritance Is Not for Code Reuse

Most engineers try inheritance for reuse first. It feels neat: common code goes in a base class, child classes reuse it, duplication disappears.

Then requirements change.

You need one behavior from class A, another from class B, and a third variation for a new feature flag.  
That is where inheritance starts fighting you.

This article explains why.

---

## The Core Claim

Inheritance is best for:

- subtype modeling (`is-a`)
- polymorphism
- substitutability (child can be used wherever parent is expected)

Inheritance is weak for:

- "I only want to reuse this one method"
- recombining behaviors from different branches
- rapidly changing product logic

---

## Why Inheritance Feels "All or Nothing"

When you `extends BaseClass`, you inherit a bundle:

- data assumptions
- method contracts
- lifecycle hooks
- coupling to parent internals

You cannot inherit "just one method" cleanly.  
You inherit the whole relationship.

---

## Concrete Example A: Product Listing Sorts

### Version 1 (Inheritance approach)

```ts
type Product = {
  id: string;
  priceCents: number;
  rating: number;
  isFeatured: boolean;
};

class BaseProductService {
  protected fetchAll(products: Product[]): Product[] {
    return products;
  }

  list(products: Product[]): Product[] {
    return this.fetchAll(products);
  }
}

class PriceAscProductService extends BaseProductService {
  override list(products: Product[]): Product[] {
    return [...this.fetchAll(products)].sort((a, b) => a.priceCents - b.priceCents);
  }
}

class FeaturedProductService extends BaseProductService {
  override list(products: Product[]): Product[] {
    return [...this.fetchAll(products)].sort((a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured),
    );
  }
}
```

Now product asks for:

- `featured_then_price_desc`
- `rating_then_featured`
- special sorting per country

You start creating subclass combinations or duplicating override logic.  
Hierarchy grows, clarity drops.

### Version 2 (Composition approach)

```ts
type SortMode = "featured" | "price_asc" | "price_desc" | "rating_desc";
type ProductSorter = (items: Product[]) => Product[];

const sorters: Record<SortMode, ProductSorter> = {
  featured: items =>
    [...items].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)),
  price_asc: items => [...items].sort((a, b) => a.priceCents - b.priceCents),
  price_desc: items => [...items].sort((a, b) => b.priceCents - a.priceCents),
  rating_desc: items => [...items].sort((a, b) => b.rating - a.rating),
};

class ProductService {
  list(products: Product[], mode: SortMode): Product[] {
    return sorters[mode](products);
  }
}
```

Adding a new behavior is now adding one entry, not editing class hierarchy shape.

---

## Concrete Example B: "I Need One Method From Parent"

### Inheritance misuse

```ts
class ReportBase {
  protected sanitize(input: string): string {
    return input.trim().replace(/\s+/g, " ");
  }

  protected addAuditTrail(): void {
    // writes logs, touches external system
  }
}

class CsvExporter extends ReportBase {
  export(name: string): string {
    return this.sanitize(name); // only wanted sanitize()
  }
}
```

`CsvExporter` inherits audit behavior and parent coupling it does not need.

### Better extraction

```ts
class TextSanitizer {
  sanitize(input: string): string {
    return input.trim().replace(/\s+/g, " ");
  }
}

class CsvExporter {
  constructor(private readonly sanitizer: TextSanitizer) {}

  export(name: string): string {
    return this.sanitizer.sanitize(name);
  }
}
```

Now reuse is explicit and minimal.

---

## "But Isn’t This Duplication?"

Good question.

Composition does not mean copy-paste.  
It means extracting reusable units and assembling them where needed.

That gives you:

- reuse without hierarchy lock-in
- focused tests per unit
- safer changes

---

## When to Use Inheritance

Use inheritance when all are true:

1. Child is truly a subtype of parent.
2. Child behavior is substitutable for parent behavior.
3. Shared behavior is stable and central to that type family.

If any of these fail, prefer composition.

---

## Quick Decision Checklist

Before using inheritance, ask:

- Am I modeling a real `is-a` relationship?
- Do I need polymorphism, or just one helper method?
- Will I need to recombine behaviors later?
- Will overrides likely multiply?

If answers point to variation + recombination, choose composition first.

---

## Interview-Ready Summary

> Inheritance is a modeling tool for polymorphic type hierarchies, not a default code-reuse mechanism.  
> For reusable and evolving behavior, composition is usually safer because it avoids all-or-nothing coupling and allows flexible combinations.
