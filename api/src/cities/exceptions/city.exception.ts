import { BadRequestException } from '@nestjs/common';

export class CityNameAlreadyExistsException extends BadRequestException {
  constructor(name: string) {
    super({
      statusCode: 400,
      message: `City with name '${name}' already exists.`,
      error: 'Bad Request',
    });
  }
}

export class LatLngInvalidException extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Latitude and Longitude must be valid coordinates.',
      error: 'Bad Request',
    });
  }
}
