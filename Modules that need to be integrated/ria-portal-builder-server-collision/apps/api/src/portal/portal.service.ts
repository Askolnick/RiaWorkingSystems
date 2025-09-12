import { Injectable } from '@nestjs/common'
import { PortalRepo } from './portal.repo'
@Injectable()
export class PortalService {
  constructor(private repo: PortalRepo){}
  get(tenantId:string, userId:string, name='default'){ return this.repo.getLayout(tenantId, userId, name) }
  save(layout:any){ return this.repo.saveLayout(layout) }
}
