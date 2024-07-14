import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorDTO } from '../dto/error/error.dto';

export function ApiErrorDecorator(
  statusCode: HttpStatus,
  message: string,
  fields?: string[],
  description?: string,
  options?: ApiResponseOptions,
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      status: statusCode,
      description: description,
      schema: {
        default: {
          message: message,
          status_code: statusCode,
          date: new Date().toISOString(),
          fields: fields,
        },
        type: getSchemaPath(ErrorDTO),
      },
    }),
  );
}
