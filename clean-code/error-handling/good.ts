/**
 * Good: typed errors, fail fast, and explicit boundaries so HTTP layer can map to status codes.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "VALIDATION_ERROR", options);
    this.name = "ValidationError";
  }
}

/**
 * No silent success: invalid input is a first-class error with a code.
 */
export function parseUserIdSafe(raw: string): number {
  if (raw.trim() === "" || !/^\d+$/.test(raw.trim())) {
    throw new ValidationError(`Invalid user id: ${raw}`);
  }
  return Number.parseInt(raw, 10);
}

/**
 * Rethrow after logging so global middleware can return 5xx/4xx and metrics stay honest.
 * In an Express app, wrap route handlers in async error middleware; never swallow.
 */
export async function saveOrderSafe(
  orderId: string,
  _data: object,
  log: (msg: string, ctx: Record<string, unknown>) => void = console.error,
): Promise<void> {
  if (!orderId?.trim()) {
    throw new ValidationError("orderId is required");
  }
  if (orderId === "BOOM") {
    const err = new Error("network hiccup");
    log("save order failed", { orderId, err });
    throw err; // or wrap in AppError for stable codes
  }
  // success path
}

/** Map to HTTP: ValidationError -> 400, AppError by code, unknown -> 500. */
export function toHttpStatus(err: unknown): number {
  if (err instanceof ValidationError) return 400;
  if (err instanceof AppError) return 422;
  return 500;
}
