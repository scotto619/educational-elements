// utils/apiHelpers.ts - Shared API route utilities
import type { NextApiRequest, NextApiResponse } from 'next';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

// ── ApiError ──────────────────────────────────────────────────────────────────

/**
 * Throw inside any handler to return a specific HTTP status + JSON error.
 * Automatically caught by `withHandler`.
 *
 * @example
 *   throw new ApiError(404, 'Student not found');
 *   throw new ApiError(403, 'Unauthorized', { required: 'teacher' });
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── requireFields ─────────────────────────────────────────────────────────────

/**
 * Validates that all required fields are present and non-empty in `body`.
 * Throws `ApiError(400)` if any are missing.
 *
 * @example
 *   requireFields(req.body, ['classId', 'firstName', 'teacherUserId']);
 */
export function requireFields(
  body: Record<string, unknown> | undefined | null,
  fields: string[]
): void {
  if (!body) {
    throw new ApiError(400, 'Request body is required');
  }
  const missing = fields.filter(
    f => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length > 0) {
    throw new ApiError(400, 'Missing required fields', { required: missing });
  }
}

// ── withHandler ───────────────────────────────────────────────────────────────

type HandlerFn = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * Wraps a Next.js API handler with:
 * - HTTP method guard → 405 for disallowed methods
 * - `ApiError` → structured JSON at the specified status code
 * - All other thrown errors → 500 with the error message
 *
 * @example
 *   export default withHandler('POST', async (req, res) => {
 *     requireFields(req.body, ['studentId', 'amount']);
 *     // ... handler logic
 *     res.status(200).json({ success: true });
 *   });
 */
export function withHandler(
  method: string | string[],
  fn: HandlerFn
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  const allowed = (Array.isArray(method) ? method : [method]).map(m =>
    m.toUpperCase()
  );

  return async (req, res) => {
    if (!allowed.includes(req.method?.toUpperCase() ?? '')) {
      res.setHeader('Allow', allowed.join(', '));
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof ApiError) {
        const body: ApiErrorResponse = { error: err.message };
        if (err.details !== undefined) body.details = err.details;
        return res.status(err.statusCode).json(body);
      }

      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('Unhandled API error:', err);
      return res.status(500).json({ error: 'Internal server error', message });
    }
  };
}
