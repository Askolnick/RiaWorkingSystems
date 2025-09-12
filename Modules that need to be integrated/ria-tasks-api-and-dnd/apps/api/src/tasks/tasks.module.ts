import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { TaskDepsController } from './tasks_deps.controller'
import { CustomFieldsController } from './custom_fields.controller'
import { SavedViewsController } from './saved_views.controller'
import { RoadmapController } from './roadmap.controller'
import { Repo } from './tasks.repo'
@Module({
  controllers: [TasksController, TaskDepsController, CustomFieldsController, SavedViewsController, RoadmapController],
  providers: [TasksService, Repo],
})
export class TasksModule {}