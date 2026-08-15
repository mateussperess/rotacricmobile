import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username == createUserDto.username) {
        throw new UserAlreadyExistsException('Username');
      }
      throw new UserAlreadyExistsException('Email');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.pass, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        pass: hashedPassword,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateUserDto.username
                  ? [{ username: updateUserDto.username }]
                  : []),
                ...(updateUserDto.email
                  ? [{ email: updateUserDto.email }]
                  : []),
              ],
            },
          ],
        },
      });

      if (existingUser) {
        if (
          updateUserDto.username &&
          existingUser.username === updateUserDto.username
        ) {
          throw new UserAlreadyExistsException('Username');
        }
        throw new UserAlreadyExistsException('Email');
      }
    }

    const dataToUpdate = { ...updateUserDto };
    if (dataToUpdate.pass) {
      dataToUpdate.pass = await bcrypt.hash(dataToUpdate.pass, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return new UserResponseDto(updatedUser);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário deletado com sucesso' };
  }
}
