import { BadRequestException, NotFoundException } from '@nestjs/common';

export class RouteNotFoundException extends NotFoundException {
  constructor(message: string = 'Rota não encontrada') {
    super(message);
  }
}

export class RouteAlreadyExistsException extends BadRequestException {
  constructor(message: string = 'Rota já existe') {
    super(message);
  }
}
