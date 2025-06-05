import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard) // Assuming you have an AuthGuard to protect this route
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, createArticleDto);

    return this.articleService.buildArticleResponse(article);
  }

  // Получение статьи по slug
  @Get(':slug')
  async getSingleArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  // Удаление отдельной статьи
  @Delete(':slug')
  @UseGuards(AuthGuard) // Assuming you have an AuthGuard to protect this route
  async deleteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string
  ): Promise<void> {
    const article = await this.articleService.findBySlug(slug);

    await this.articleService.deleteArticle(slug, currentUserId);
  }
}
