import { NextResponse } from "next/server";

/** Shared error shape for every /api/* response. Mirrored in /openapi.json. */
export type ApiError = {
  error: string;
  code: string;
  hint?: string;
};

export function apiError(status: number, body: ApiError, init?: ResponseInit) {
  return NextResponse.json<ApiError>(body, { ...init, status });
}

export function apiOk<T extends object>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}
