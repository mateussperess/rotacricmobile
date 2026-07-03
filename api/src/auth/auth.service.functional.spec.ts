import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService (functional)', () => {
  let service: AuthService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    prisma.user.findUnique.mockReset();
    jwtService.signAsync.mockReset();
    (bcrypt.compare as jest.Mock).mockReset();

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
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'mateus@email.com',
        pass: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('signed-jwt');

      const result = await service.login('mateus@email.com', 'secret');

      expect(result).toEqual({ access_token: 'signed-jwt' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'mateus@email.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed-password');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        username: 'mateus@email.com',
      });
    });
  });

  // ==========================================
  // CAMINHOS TRISTES (SAD PATHS)
  // ==========================================
  describe('SPs - Tratamento de Erros', () => {
    it('deve lançar UnauthorizedException se o e-mail não for encontrado', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('fantasma@email.com', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'mateus@email.com',
        pass: 'hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('mateus@email.com', 'senha-errada'),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
