import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common'
import { RoadmapItemCreate, RoadmapCommentCreate } from './dto'
@Controller('roadmap')
export class RoadmapController {
  @Get(':slug') get(@Param('slug') slug:string){ return { slug, title: 'Roadmap '+slug, items: [] } }
  @Post() create(@Body() b:any){ const input = RoadmapItemCreate.parse(b); return { ok:true, input } }
  @Post('comments') comment(@Body() b:any){ const input = RoadmapCommentCreate.parse(b); return { ok:true, input } }
}