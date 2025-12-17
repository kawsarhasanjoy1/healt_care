import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

type ErrorPayload = {
  statusCode: number;
  message: string;
  code?: string;
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errorPayload: ErrorPayload = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Something went wrong.",
  };

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : "field";

        errorPayload = {
          statusCode: StatusCodes.CONFLICT,
          message: `Duplicate value for ${target}.`,
          code: err.code,
        };
        break;
      }

      case "P2003":
        errorPayload = {
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid reference. Related record not found.",
          code: err.code,
        };
        break;

      case "P2025":
        errorPayload = {
          statusCode: StatusCodes.NOT_FOUND,
          message: "Record not found.",
          code: err.code,
        };
        break;

      default:
        errorPayload = {
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Database request error.",
          code: err.code,
        };
    }
  }

  // Prisma validation error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    errorPayload = {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid request data.",
      code: "PRISMA_VALIDATION_ERROR",
    };
  }

  // Prisma initialization / connection error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    errorPayload = {
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      message: "Database unavailable. Try again later.",
      code: "PRISMA_INIT_ERROR",
    };
  }

  // Prisma engine panic
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    errorPayload = {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Database engine crashed.",
      code: "PRISMA_PANIC",
    };
  }

  
  return res.status(errorPayload.statusCode).json({
    success: false,
    message: errorPayload.message,
    ...(errorPayload.code ? { code: errorPayload.code } : {}),
  });
};

export default globalErrorHandler;
