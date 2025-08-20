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
    console.log('🔍 Validating:', {
      value,
      type: metadata.type,
      metatype: metadata.metatype?.name
    });

    // Пропускаем валидацию для параметров пути, query и кастомных декораторов
    if (metadata.type === 'param' || metadata.type === 'query' || metadata.type === 'custom') {
      return value;
    }

    // Пропускаем UserEntity и другие entity
    if (metadata.metatype?.name === 'UserEntity' || metadata.metatype?.name?.endsWith('Entity')) {
      return value;
    }

    // Пропускаем если нет типа для валидации
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    const object = plainToClass(metadata.metatype, value);

    if (typeof object !== 'object') {
      return value;
    }

    const errors = await validate(object);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException({ errors: this.formatErrors(errors) }, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  formatErrors(errors: ValidationError[]): { [key: string]: string[] } {
    return errors.reduce((acc, error) => {
      const property = error.property || 'unknown';
      acc[property] = error.constraints ? Object.values(error.constraints) : ['Validation failed'];
      return acc;
    }, {});
  }
}
