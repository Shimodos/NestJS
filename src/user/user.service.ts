import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async createUser(): Promise<any> {
    return await Promise.resolve('User created successfully!');
  }
}
