import { JWT_SECRET } from '@app/config';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      return next();
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      if (typeof decoded === 'object' && 'id' in decoded) {
        const user = await this.userService.findById(decoded.id);
        req.user = user || null;
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  }
}
