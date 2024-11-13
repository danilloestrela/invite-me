import { MiddlewareFactory } from "@/types";
import {
  NextFetchEvent,
  NextRequest,
  NextResponse
} from "next/server";

export const withUser: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

      if (["/profile"]?.some((path) => pathname.startsWith(path))) {
        const userId = request.cookies.get("userId");
        if (!userId) {
          const url = new URL(`/auth/login`, request.url);
          return NextResponse.redirect(url);
        }
      }
      return next(request, _next);
    };
  };