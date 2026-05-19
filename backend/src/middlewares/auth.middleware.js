import { StatusCodes } from "http-status-codes";

import { authService } from "../services/auth.service.js";
import { ApiError } from "../utils/api-error.js";

export const requireAuth = async (request, _response, next) => {
  try {
    const authorization = request.get("authorization") ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
    }

    request.user = await authService.getUserFromAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
