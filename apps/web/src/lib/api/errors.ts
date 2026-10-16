export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
  }

  static network() {
    return new ApiError(0, 'NETWORK_ERROR', 'Check your internet connection and try again.');
  }
}

export const isApiError = (error: unknown, code?: string): error is ApiError =>
  error instanceof ApiError && (!code || error.code === code);

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong. Please try again.';
}
