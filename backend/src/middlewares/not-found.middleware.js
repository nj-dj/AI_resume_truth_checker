import { StatusCodes } from "http-status-codes";

export const notFoundHandler = (request, response) => {
  response.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
};
