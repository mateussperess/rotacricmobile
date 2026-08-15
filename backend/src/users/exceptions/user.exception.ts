import { BadRequestException } from '@nestjs/common';

export class UserAlreadyExistsException extends BadRequestException {
  constructor(field: string) {
    super({
      statusCode: 400,
      message: `${field} já está em uso`,
      error: 'Bad Request',
    });
  }
}

export class UserNotFoundException extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Usuário não encontrado',
      error: 'Bad Request',
    });
  }
}
