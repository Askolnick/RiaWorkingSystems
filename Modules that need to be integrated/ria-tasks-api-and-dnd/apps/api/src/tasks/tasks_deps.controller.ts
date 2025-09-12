import { Controller, Post, Delete, Body, Param, Headers } from '@nestjs/common'
import { z } from 'zod'
import { DepCreate } from './dto'
@Controller('task-dependencies')
export class TaskDepsController {
  @Post() create(@Body() b:any, @Headers() h:any){ const input = DepCreate.parse(b); return { ok:true, input } }
  @Delete(':id') remove(@Param('id') id:string){ return { ok:true, id } }
}