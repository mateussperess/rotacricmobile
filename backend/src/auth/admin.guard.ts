import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.is_staff && !user.is_superuser)) {
      throw new ForbiddenException('Acesso restrito a administradores!');
    }

    return true;
  }
}
