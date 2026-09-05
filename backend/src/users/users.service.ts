import { Injectable } from '@nestjs/common';
import { DjangoPasswordUtil } from 'src/auth/django-password.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from './exceptions/user.exception';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.authUser.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new UserAlreadyExistsException('Username');
      }
      throw new UserAlreadyExistsException('Email');
    }

    const hashedPassword = DjangoPasswordUtil.hashPassword(createUserDto.pass);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.authUser.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          first_name: createUserDto.first_name,
          last_name: createUserDto.last_name,
          password: hashedPassword,
          is_superuser: false,
          is_staff: false,
          is_active: true,
          date_joined: new Date(),
        },
      });

      await tx.userProfile.create({
        data: {
          user_id: createdUser.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return tx.authUser.findUnique({
        where: { id: createdUser.id },
        include: { profile: true },
      });
    });

    return new UserResponseDto(user);
  }

  async findAll() {
    const users = await this.prisma.authUser.findMany({
      include: { profile: true },
    });
    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.authUser.findUnique({
        where: { id: Number(id) },
        include: { profile: true },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      return new UserResponseDto(user);
    } catch {
      throw new UserNotFoundException();
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const userId = Number(id);
      const user = await this.prisma.authUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      const authUserDataToUpdate: any = {};
      if (updateUserDto.username) authUserDataToUpdate.username = updateUserDto.username;
      if (updateUserDto.email) authUserDataToUpdate.email = updateUserDto.email;
      if (updateUserDto.first_name !== undefined) authUserDataToUpdate.first_name = updateUserDto.first_name;
      if (updateUserDto.last_name !== undefined) authUserDataToUpdate.last_name = updateUserDto.last_name;
      if (updateUserDto.pass) {
        authUserDataToUpdate.password = DjangoPasswordUtil.hashPassword(updateUserDto.pass);
      }

      const profileDataToUpdate: any = {};
      if (updateUserDto.birth_date !== undefined) {
        if (updateUserDto.birth_date && updateUserDto.birth_date.trim()) {
          const rawDateStr = updateUserDto.birth_date.trim();
          const cleanDateStr = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr;
          profileDataToUpdate.birth_date = new Date(`${cleanDateStr}T00:00:00Z`);
        } else {
          profileDataToUpdate.birth_date = null;
        }
      }
      if (updateUserDto.document !== undefined) {
        profileDataToUpdate.document = updateUserDto.document?.trim() || null;
      }
      if (updateUserDto.document_type !== undefined) {
        profileDataToUpdate.document_type = updateUserDto.document_type?.trim() || null;
      }
      if (updateUserDto.social_network !== undefined) {
        profileDataToUpdate.social_network = updateUserDto.social_network?.trim() || null;
      }
      if (updateUserDto.social_network_type !== undefined) {
        profileDataToUpdate.social_network_type = updateUserDto.social_network_type?.trim() || null;
      }

      const updatedUser = await this.prisma.$transaction(async (tx) => {
        if (Object.keys(authUserDataToUpdate).length > 0) {
          await tx.authUser.update({
            where: { id: userId },
            data: authUserDataToUpdate,
          });
        }

        if (Object.keys(profileDataToUpdate).length > 0) {
          await tx.userProfile.upsert({
            where: { user_id: userId },
            create: {
              user_id: userId,
              ...profileDataToUpdate,
              created_at: new Date(),
              updated_at: new Date(),
            },
            update: {
              ...profileDataToUpdate,
              updated_at: new Date(),
            },
          });
        }

        return tx.authUser.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
      });

      return new UserResponseDto(updatedUser);
    } catch (err) {
      console.error('Erro no update do usuario:', err);
      throw new UserNotFoundException();
    }
  }

  async remove(id: string) {
    try {
      const userId = Number(id);
      const user = await this.prisma.authUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      await this.prisma.$transaction([
        this.prisma.userProfile.deleteMany({ where: { user_id: userId } }),
        this.prisma.authUser.delete({ where: { id: userId } }),
      ]);

      return { message: 'Usuário deletado com sucesso' };
    } catch {
      throw new UserNotFoundException();
    }
  }
}
