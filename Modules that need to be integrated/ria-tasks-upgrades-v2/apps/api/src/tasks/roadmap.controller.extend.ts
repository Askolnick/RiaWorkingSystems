import { Controller, Post, Body } from '@nestjs/common'
import { RoadmapVotesService } from './roadmap.votes.service'
@Controller('roadmap-votes')
export class RoadmapVotesController {
  constructor(private votes: RoadmapVotesService){}
  @Post() vote(@Body() b:any){ return this.votes.vote(b) }
}
