// current-user.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  ACCESS_TOKEN,
  accessTokenSecret,
} from 'src/infra/cryptography/token-type';

export const CurrentUser = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const jwtService = new JwtService({
      secret: accessTokenSecret(),
    });

    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException('Token não encontrado no cabeçalho');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    let payload;
    try {
      payload = await jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    if (payload?.type !== ACCESS_TOKEN) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return payload;
  },
);
