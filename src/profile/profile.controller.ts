import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileResponseInterface } from './types/profileRespons.interface';
import { ProfileService } from './profile.service';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('name') username: string,
    @User('id') currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(currentUserId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followUser(
    @Param('name') username: string,
    @User('id') currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(currentUserId, username);
    return this.profileService.buildProfileResponse(profile);
  }
}
