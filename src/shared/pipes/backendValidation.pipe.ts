import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
  ValidationError
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value;
    }
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);
    console.log('Validation succeeded:', object, errors);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException({ errors: this.formatErrors(errors) }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
  formatErrors(errors: ValidationError[]): { [key: string]: string[] } {
    return errors.reduce((acc, error) => {
      acc[error.property] = error.constraints ? Object.values(error.constraints) : [];
      console.log('Validation failed:', error, acc);
      return acc;
    }, {});
  }
}
