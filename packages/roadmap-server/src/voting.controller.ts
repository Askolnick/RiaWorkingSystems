import { 
  RoadmapVotingService, 
  CreateVoteInput,
  type VoteScore,
  type RoadmapVote 
} from './voting.service';

/**
 * Roadmap Voting Controller - HTTP API layer for roadmap voting
 * This controller provides RESTful endpoints for voting on roadmap items.
 */
export class RoadmapVotingController {
  constructor(private readonly votingService: RoadmapVotingService) {}

  /**
   * POST /roadmap/:id/vote - Cast or update vote for roadmap item
   */
  async vote(tenantId: string, roadmapItemId: string, input: CreateVoteInput) {
    return this.votingService.vote(tenantId, {
      ...input,
      roadmapItemId,
    });
  }

  /**
   * DELETE /roadmap/:id/vote/:membershipId - Remove vote for roadmap item
   */
  async removeVote(tenantId: string, roadmapItemId: string, voterMembershipId: string) {
    const newScore = await this.votingService.removeVote(tenantId, roadmapItemId, voterMembershipId);
    return { ok: true, newScore };
  }

  /**
   * GET /roadmap/:id/score - Get vote score for roadmap item
   */
  async getScore(tenantId: string, roadmapItemId: string): Promise<VoteScore> {
    return this.votingService.getVoteScore(tenantId, roadmapItemId);
  }

  /**
   * GET /roadmap/:id/votes - Get all votes for roadmap item
   */
  async getVotes(tenantId: string, roadmapItemId: string): Promise<RoadmapVote[]> {
    return this.votingService.getVotes(tenantId, roadmapItemId);
  }

  /**
   * GET /roadmap/:id/vote/me - Get current user's vote for roadmap item
   */
  async getUserVote(tenantId: string, roadmapItemId: string, voterMembershipId: string): Promise<RoadmapVote | null> {
    return this.votingService.getUserVote(tenantId, roadmapItemId, voterMembershipId);
  }

  /**
   * GET /roadmap/top - Get top voted roadmap items
   */
  async getTopVotedItems(tenantId: string, limit?: number): Promise<Array<{ roadmapItemId: string; score: number }>> {
    return this.votingService.getTopVotedItems(tenantId, limit);
  }
}

// Utility function to extract tenant ID from request headers
export function extractTenantId(headers: Record<string, any>): string {
  return headers['x-tenant-id'] || 'demo-tenant';
}

// Export types for use in the main API application
export type { CreateVoteInput, VoteScore, RoadmapVote };