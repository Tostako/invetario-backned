import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

// Centraliza el formato de todas las respuestas HTTP de la API
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): void => {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T): void => {
  sendSuccess(res, data, 201);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): void => {
  const response: ApiResponse = { success: false, message };
  res.status(statusCode).json(response);
};
