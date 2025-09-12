import { Injectable } from '@nestjs/common'
type VoteKind = 'standard'|'referenced'|'expert'|'expert_referenced'
function roleWeight(role: string){ return ({ super_admin:3, admin:2, moderator:2, member:1, client_member:1 } as any)[role] ?? 1 }
function kindWeight(kind: VoteKind){ return ({ standard:1, referenced:1.25, expert:1.5, expert_referenced:1.75 } as any)[kind] ?? 1 }
@Injectable()
export class RoadmapVotesService {
  // Placeholder in-memory
  private votes: { itemId:string; voterMembershipId:string; role:string; kind:VoteKind }[] = []
  score(itemId: string){ return this.votes.filter(v=>v.itemId===itemId).reduce((s,v)=>s+roleWeight(v.role)*kindWeight(v.kind), 0) }
  async vote(input:{ itemId:string; voterMembershipId:string; role:string; kind:VoteKind }){
    const i = this.votes.findIndex(v=>v.itemId===input.itemId && v.voterMembershipId===input.voterMembershipId)
    if (i>=0) this.votes[i] = input; else this.votes.push(input)
    return { ok:true, score: this.score(input.itemId) }
  }
}