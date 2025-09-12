import { Module } from '@nestjs/common'
import { PortalController } from './portal.controller'
import { PortalService } from './portal.service'
import { PortalRepo } from './portal.repo'

@Module({ controllers:[PortalController], providers:[PortalService, PortalRepo] })
export class PortalModule {}
