import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [] // Exporting nothing for now, can be modified later
})
export class ArticleModule {}
