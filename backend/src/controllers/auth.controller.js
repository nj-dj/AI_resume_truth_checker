import { StatusCodes } from "http-status-codes";

import { authService } from "../services/auth.service.js";
import { loginSchema, refreshTokenSchema, signupSchema } from "../validators/auth.validator.js";

export const signup = async (request, response) => {
  const payload = signupSchema.parse(request.body);
  const session = await authService.signup(payload);

  response.status(StatusCodes.CREATED).json({
    success: true,
    data: session,
  });
};

export const login = async (request, response) => {
  const payload = loginSchema.parse(request.body);
  const session = await authService.login(payload);

  response.status(StatusCodes.OK).json({
    success: true,
    data: session,
  });
};

export const refresh = async (request, response) => {
  const payload = refreshTokenSchema.parse(request.body);
  const session = await authService.refresh(payload.refreshToken);

  response.status(StatusCodes.OK).json({
    success: true,
    data: session,
  });
};

export const me = (request, response) => {
  response.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: request.user,
    },
  });
};

export const logout = (_request, response) => {
  response.status(StatusCodes.OK).json({
    success: true,
    message: "Signed out",
  });
};
