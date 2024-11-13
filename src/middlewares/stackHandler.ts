import { MiddlewareFactory } from "@/types";
import {
  NextMiddleware,
  NextResponse
} from "next/server";

export function stackMiddlewares(functions: MiddlewareFactory[] | [] = [], index = 0): NextMiddleware {
  if(!functions || functions.length === 0) return () => NextResponse.next();
  const current = functions[index];
  if (current) {
    const next = stackMiddlewares(functions, index + 1);
    return current(next);
  }
  return () => NextResponse.next();
}