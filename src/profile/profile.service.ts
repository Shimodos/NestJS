import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileType } from './types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from './types/profileRespons.interface';
import { FollowEntity } from './folow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>
  ) {}

  async getProfile(currentUserId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id
      }
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(currentUserId: number, username: string): Promise<ProfileType> {
    const userToFollow = await this.userRepository.findOne({ where: { username } });

    if (!userToFollow) {
      throw new HttpException('User to follow not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === userToFollow.id) {
      throw new HttpException('Current user cannot follow themselves', HttpStatus.FORBIDDEN);
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: userToFollow.id
      }
    });

    if (!follow) {
      const newFollow = new FollowEntity();
      newFollow.followerId = currentUserId;
      newFollow.followingId = userToFollow.id;
      await this.followRepository.save(newFollow);
    }

    return { ...userToFollow, following: true };
  }

  async unfollowProfile(currentUserId: number, username: string): Promise<ProfileType> {
    const userToUnfollow = await this.userRepository.findOne({ where: { username } });

    if (!userToUnfollow) {
      throw new HttpException('User to unfollow not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === userToUnfollow.id) {
      throw new HttpException('Current user cannot unfollow themselves', HttpStatus.FORBIDDEN);
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: userToUnfollow.id
    });

    return { ...userToUnfollow, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile
    };
  }
}
