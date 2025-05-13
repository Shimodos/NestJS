import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { userResponseInterface } from './types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }

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

  buildUserResponse(user: UserEntity): userResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user)
      }
    };
  }
}
