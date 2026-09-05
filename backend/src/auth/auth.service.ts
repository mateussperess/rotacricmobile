import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { DjangoPasswordUtil } from './django-password.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(identifier: string, pass: string) {
    const user = await this.prisma.authUser.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const passMatch = await DjangoPasswordUtil.verifyPassword(pass, user.password);

    if (!passMatch) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    // Update last_login
    await this.prisma.authUser.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const payload = { sub: user.id.toString(), username: user.username, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile?.profile_picture_path
          ? `${process.env.MEDIA_BASE_URL || 'https://rota-cric.charqueadas.ifsul.edu.br/media/'}${user.profile.profile_picture_path}`
          : null,
      },
    };
  }
}
