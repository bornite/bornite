import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { DomainError, InvalidArgumentError } from '../../../domain';
import { NotFoundError } from '../../../application';

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

/**
 * Translates errors into HTTP responses at the edge, keeping the mapping out of
 * controllers and the core:
 *  - {@link NotFoundError} (application)            → 404
 *  - {@link InvalidArgumentError} (domain)          → 400
 *  - other {@link DomainError} (rule violations)    → 409
 *  - anything else                                  → 500
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof InvalidArgumentError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof DomainError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({ statusCode: status, message });
  }
}
