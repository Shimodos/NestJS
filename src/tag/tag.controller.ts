import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<{ tags: { id: number; name: string }[] }> {
    const tags = await this.tagService.findAll();
    return {
      tags: tags.map((tag) => ({ id: tag.id, name: tag.name }))
    };
  }
}
