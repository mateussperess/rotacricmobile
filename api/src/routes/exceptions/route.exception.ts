import { NotFoundException } from '@nestjs/common';

export class RouteNotFoundException extends NotFoundException {
  constructor() {
    super('Rota não encontrada');
  }
}
