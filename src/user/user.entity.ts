import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { hash } from 'bcrypt';

@Entity({ name: 'users' })
export class UserEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
