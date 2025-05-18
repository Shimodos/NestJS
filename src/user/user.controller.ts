import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { userResponseInterface } from './types/userResponse.interface';
import { Request } from 'express';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /// Создание нового пользователя
  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<userResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  /// Авторизация пользователя
  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<userResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  /// Получение текущего пользователя
  @Get('user')
  async getCurrentUser(
    // @Req() req: ExpressRequestInterface,
    @User() user: UserEntity,
    @User('id') userId: number
  ): Promise<userResponseInterface> {
    console.log('user', user);
    console.log('userId', userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return this.userService.buildUserResponse(user);
  }
}
