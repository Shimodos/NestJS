import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticleDto.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author']
    });
    if (!article) {
      throw new Error(`Article with slug ${slug} not found`);
    }
    return article;
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    // Проверка, что текущий пользователь является автором статьи
    if (!article) {
      throw new HttpException(`Article with slug ${slug} not found`, HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You do not have permission to delete this article',
        HttpStatus.FORBIDDEN
      );
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(slug: string, updateArticleDto: UpdateArticleDto, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    // Проверка, что текущий пользователь является автором статьи
    if (!article) {
      throw new HttpException(`Article with slug ${slug} not found`, HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You do not have permission to update this article',
        HttpStatus.FORBIDDEN
      );
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  // Генерация уникального слага на основе заголовка статьи и случайной строки
  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + Math.random().toString(36).substring(2, 15);
  }
}
