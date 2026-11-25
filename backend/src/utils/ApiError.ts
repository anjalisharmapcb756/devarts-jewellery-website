export type ApiErrorOptions = {
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}
