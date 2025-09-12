import { Controller, Get, Post, Patch, Param, Body, Query, Headers } from '@nestjs/common'
import { z } from 'zod'
import { TasksService } from './tasks.service'
import { TaskCreate, TaskUpdate } from './dto'
function tenant(h: any){ return h['x-tenant-id'] || 'demo-tenant' }
@Controller('tasks')
export class TasksController {
  constructor(private svc: TasksService) {}
  @Get() list(@Query() q: any, @Headers() h:any){ return this.svc.list(tenant(h), q) }
  @Post() create(@Body() b:any, @Headers() h:any){ const input = TaskCreate.parse(b); return this.svc.create(tenant(h), input) }
  @Patch(':id') update(@Param('id') id: string, @Body() b:any, @Headers() h:any){ const input = TaskUpdate.parse(b); return this.svc.update(tenant(h), id, input) }
}