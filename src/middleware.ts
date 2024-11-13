import {
    stackMiddlewares
} from "@/middlewares/stackHandler";
import { MiddlewareFactory } from "@/types/middlewareTypes";

const middlewares: MiddlewareFactory[] = [];
export default stackMiddlewares(middlewares);
