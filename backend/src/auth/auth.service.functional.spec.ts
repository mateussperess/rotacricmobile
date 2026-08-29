import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { DjangoPasswordUtil } from './django-password.util';

describe('AuthService (functional)', () => {
  let service: AuthService;

  const prisma = {
    authUser: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    prisma.authUser.findFirst.mockReset();
    prisma.authUser.update.mockReset();
    jwtService.signAsync.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ==========================================
  // CAMINHO FELIZ (HAPPY PATH)
  // ==========================================
  describe('HP - Sucesso no Login', () => {
    it('validates credentials and returns a signed access token', async () => {
      prisma.authUser.findFirst.mockResolvedValue({
        id: 1,
        username: 'mateus',
        email: 'mateus@email.com',
        first_name: 'Mateus',
        last_name: 'Peres',
        password: 'pbkdf2_sha256$260000$mock$hashedpass',
        profile: null,
      });
      jest.spyOn(DjangoPasswordUtil, 'verifyPassword').mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('signed-jwt');
      prisma.authUser.update.mockResolvedValue({});

      const result = await service.login('mateus@email.com', 'secret');

      expect(result.access_token).toEqual('signed-jwt');
      expect(prisma.authUser.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'mateus@email.com' }, { username: 'mateus@email.com' }],
        },
        include: { profile: true },
      });
      expect(DjangoPasswordUtil.verifyPassword).toHaveBeenCalledWith('secret', 'pbkdf2_sha256$260000$mock$hashedpass');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        username: 'mateus',
        email: 'mateus@email.com',
      });
    });
  });

  // ==========================================
  // CAMINHOS TRISTES (SAD PATHS)
  // ==========================================
  describe('SPs - Tratamento de Erros', () => {
    it('deve lançar UnauthorizedException se o e-mail não for encontrado', async () => {
      prisma.authUser.findFirst.mockResolvedValue(null);

      await expect(
        service.login('fantasma@email.com', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      prisma.authUser.findFirst.mockResolvedValue({
        id: 1,
        username: 'mateus',
        email: 'mateus@email.com',
        password: 'pbkdf2_sha256$260000$mock$hashedpass',
      });

      jest.spyOn(DjangoPasswordUtil, 'verifyPassword').mockResolvedValue(false);

      await expect(
        service.login('mateus@email.com', 'senha-errada'),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
