import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticleDto.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, In, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/ArticlesResponse,interface';
import { FollowEntity } from '@app/profile/folow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
    private dataSource: DataSource
  ) {}

  async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    // Фильтрация по тегам
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', { tag: `%${query.tag}%` });
    }

    // Фильтрация по избранным статьям
    if (query.favorited) {
      const favoritedUser = await this.userRepository.findOne({
        where: { name: query.favorited },
        relations: ['favoritedArticles']
      });

      if (favoritedUser) {
        const ids = favoritedUser.favoritedArticles.map((el) => el.id);
        if (ids.length > 0) {
          queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
        } else {
          queryBuilder.andWhere('1=0');
        }
      }
    }

    // Пагинация
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favoritedArticles']
      });
      if (user) {
        favoriteIds = user.favoritedArticles.map((favoritedArticles) => favoritedArticles.id);
      }
    }

    // Поиск по автору
    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author }
      });
      if (author) {
        queryBuilder.andWhere('articles.author.id = :id', { id: author.id });
      }
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const isFavorited = favoriteIds.includes(article.id);

      return {
        ...article,
        isFavorited
      };
    });

    return {
      articles: articlesWithFavorited,
      articlesCount
    };
  }

  async getUserFeed(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId }
    });

    if (follows.length === 0) {
      return {
        articles: [],
        articlesCount: 0
      };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.author.id IN (:...ids)', { ids: followingUserIds })
      .orderBy('articles.createdAt', 'DESC');

    const articleCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    return {
      articles: await queryBuilder.getMany(),
      articlesCount: articleCount
    };
  }

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

  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    currentUserId: number
  ): Promise<ArticleEntity> {
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

  async addFavoriteArticle(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favoritedArticles']
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Проверка, что статья уже добавлена в избранное
    if (user.favoritedArticles.some((favArticle) => favArticle.id === article.id)) {
      throw new HttpException('Article already favorited', HttpStatus.BAD_REQUEST);
    }

    user.favoritedArticles.push(article);
    article.favoritesCount++;
    // Обновляем количество лайков статьи
    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  async removeFavoriteArticle(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favoritedArticles']
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Проверка, что статья не в избранном
    if (!user.favoritedArticles.some((favArticle) => favArticle.id === article.id)) {
      throw new HttpException('Article not favorited', HttpStatus.BAD_REQUEST);
    }

    user.favoritedArticles = user.favoritedArticles.filter(
      (favArticle) => favArticle.id !== article.id
    );
    article.favoritesCount--;
    // Обновляем количество лайков статьи
    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  // Генерация уникального слага на основе заголовка статьи и случайной строки
  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + Math.random().toString(36).substring(2, 15);
  }
}
