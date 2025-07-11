import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { hash } from 'bcrypt';
import { ArticleEntity } from '@app/article/article.entity';

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
  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles: ArticleEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favoritedArticles: ArticleEntity[];
}
