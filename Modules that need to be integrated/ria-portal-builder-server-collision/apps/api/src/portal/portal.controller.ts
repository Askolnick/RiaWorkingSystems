import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common'
import { PortalService } from './portal.service'
function tenant(h:any){ return h['x-tenant-id'] || 'demo-tenant' }
function user(h:any){ return h['x-user-id'] || 'demo-user' }
@Controller('portal')
export class PortalController {
  constructor(private svc: PortalService){}
  @Get('layout')
  get(@Headers() h:any, @Query('name') name='default'){ return this.svc.get(tenant(h), user(h), name) }
  @Post('layout')
  save(@Headers() h:any, @Body() b:any){
    const layout = { ...b, tenantId: tenant(h), userId: user(h) }
    return this.svc.save(layout)
  }
}
