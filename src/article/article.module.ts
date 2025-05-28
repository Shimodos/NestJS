import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity])], // Specify the entities here if needed
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [] // Exporting nothing for now, can be modified later
})
export class ArticleModule {}
