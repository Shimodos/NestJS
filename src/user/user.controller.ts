import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { userResponseInterface } from './types/userResponse.interface';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/upadateUser.dto';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /// Создание нового пользователя
  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<userResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  /// Авторизация пользователя
  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<userResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  /// Получение текущего пользователя
  @Get('user')
  @UseGuards(AuthGuard)
  async getCurrentUser(
    @User() user: UserEntity,
    @User('id') userId: number
  ): Promise<userResponseInterface> {
    console.log('user', user);
    console.log('userId', userId);

    return this.userService.buildUserResponse(user);
  }

  /// Разрешение данных пользователя
  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto
  ): Promise<userResponseInterface> {
    const user = await this.userService.updateUser(currentUserId, updateUserDto);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.userService.buildUserResponse(user);
  }
}
