import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common'
import { SavedViewCreate } from './dto'
@Controller('saved-views')
export class SavedViewsController {
  @Get() list(@Query() q:any){ return { items: [], q } }
  @Post() create(@Body() b:any){ const input = SavedViewCreate.parse(b); return { ok:true, input } }
}