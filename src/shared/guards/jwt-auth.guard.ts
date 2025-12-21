import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { auth } from 'src/modules/auth/auth-lib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    // Fetch full user from database including role field
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!fullUser) {
      throw new UnauthorizedException();
    }

    // Attach full user (with role) to request for use in controllers
    request.user = fullUser;
    (request as any).session = session.session;

    return true;
  }
}
