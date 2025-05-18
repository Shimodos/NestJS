import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: any, ctx: ExecutionContext): any => {
  const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

  if (!request.user) {
    return null; // or throw an error if you prefer
  }

  if (data) {
    return request.user[data]; // Return specific property if data is provided
  }

  return request.user;
});
