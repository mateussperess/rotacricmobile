import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const passMatch = await bcrypt.compare(pass, user.pass);

    if (!passMatch) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const payload = { sub: user.id, username: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
