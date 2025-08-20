import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { userResponseInterface } from './types/userResponse.interface';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/upadateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  /// Создание нового пользователя
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const errorResponse = { errors: {} };
    // Проверка на уникальность email и username
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });
    const userByUsername = await this.userRepository.findOne({
      where: { name: createUserDto.name }
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'Email already exists';
    }

    if (userByUsername) {
      errorResponse.errors['username'] = 'Username already exists';
    }

    if (userByEmail) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (userByUsername) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }

  /// Авторизация пользователя
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: { 'email or password': 'is invalid' }
    };
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'email', 'name', 'password', 'bio', 'image']
    });

    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword as UserEntity;
  }

  /// Генерация JWT токена
  generateJwt(user: UserEntity): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET
    );
  }

  /// Поиск пользователя по ID
  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    return user || null;
  }

  /// Обновление данных пользователя
  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity | null> {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /// Формирование ответа с пользователем
  buildUserResponse(user: UserEntity): userResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user)
      }
    };
  }
}
