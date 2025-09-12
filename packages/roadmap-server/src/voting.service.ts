import { z } from 'zod';

// Voting types
export type VoteKind = 'standard' | 'referenced' | 'expert' | 'expert_referenced';
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'member' | 'client_member';

export interface RoadmapVote {
  id: string;
  tenantId: string;
  roadmapItemId: string;
  voterMembershipId: string;
  voterRole: UserRole;
  voteKind: VoteKind;
  createdAt: string;
  updatedAt: string;
}

// Zod schemas for validation
export const CreateVoteSchema = z.object({
  roadmapItemId: z.string().uuid(),
  voterMembershipId: z.string().uuid(),
  voterRole: z.enum(['super_admin', 'admin', 'moderator', 'member', 'client_member']),
  voteKind: z.enum(['standard', 'referenced', 'expert', 'expert_referenced']).default('standard'),
});

export type CreateVoteInput = z.infer<typeof CreateVoteSchema>;

export interface VoteScore {
  roadmapItemId: string;
  totalScore: number;
  voteCount: number;
  breakdown: {
    role: UserRole;
    kind: VoteKind;
    count: number;
    weightedScore: number;
  }[];
}

/**
 * Weight calculation functions for role-based weighted voting
 */
function getRoleWeight(role: UserRole): number {
  const weights: Record<UserRole, number> = {
    super_admin: 3,
    admin: 2,
    moderator: 2,
    member: 1,
    client_member: 1,
  };
  return weights[role] ?? 1;
}

function getKindWeight(kind: VoteKind): number {
  const weights: Record<VoteKind, number> = {
    standard: 1,
    referenced: 1.25,
    expert: 1.5,
    expert_referenced: 1.75,
  };
  return weights[kind] ?? 1;
}

/**
 * Roadmap Voting Service - Handles weighted voting for roadmap items
 * This service provides role-based and expertise-weighted voting functionality.
 */
export class RoadmapVotingService {
  constructor(private readonly votingRepository: any) {}

  /**
   * Cast or update a vote for a roadmap item
   */
  async vote(tenantId: string, input: CreateVoteInput): Promise<{ vote: RoadmapVote; newScore: number }> {
    const validatedInput = CreateVoteSchema.parse(input);
    
    // Check if user has already voted on this item
    const existingVote = await this.votingRepository.findVote({
      tenantId,
      roadmapItemId: validatedInput.roadmapItemId,
      voterMembershipId: validatedInput.voterMembershipId,
    });

    let vote: RoadmapVote;

    if (existingVote) {
      // Update existing vote
      vote = await this.votingRepository.updateVote(existingVote.id, {
        voterRole: validatedInput.voterRole,
        voteKind: validatedInput.voteKind,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new vote
      vote = await this.votingRepository.createVote({
        ...validatedInput,
        tenantId,
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Calculate new score
    const newScore = await this.calculateScore(tenantId, validatedInput.roadmapItemId);

    return { vote, newScore };
  }

  /**
   * Remove a vote for a roadmap item
   */
  async removeVote(tenantId: string, roadmapItemId: string, voterMembershipId: string): Promise<number> {
    await this.votingRepository.deleteVote({
      tenantId,
      roadmapItemId,
      voterMembershipId,
    });

    return this.calculateScore(tenantId, roadmapItemId);
  }

  /**
   * Calculate weighted score for a roadmap item
   */
  async calculateScore(tenantId: string, roadmapItemId: string): Promise<number> {
    const votes = await this.votingRepository.findVotes({
      tenantId,
      roadmapItemId,
    });

    return votes.reduce((totalScore: number, vote: RoadmapVote) => {
      const roleWeight = getRoleWeight(vote.voterRole);
      const kindWeight = getKindWeight(vote.voteKind);
      return totalScore + (roleWeight * kindWeight);
    }, 0);
  }

  /**
   * Get detailed vote score breakdown for a roadmap item
   */
  async getVoteScore(tenantId: string, roadmapItemId: string): Promise<VoteScore> {
    const votes = await this.votingRepository.findVotes({
      tenantId,
      roadmapItemId,
    });

    const breakdown = new Map<string, { role: UserRole; kind: VoteKind; count: number; weightedScore: number }>();
    let totalScore = 0;

    for (const vote of votes) {
      const key = `${vote.voterRole}-${vote.voteKind}`;
      const roleWeight = getRoleWeight(vote.voterRole);
      const kindWeight = getKindWeight(vote.voteKind);
      const score = roleWeight * kindWeight;

      if (breakdown.has(key)) {
        const existing = breakdown.get(key)!;
        existing.count += 1;
        existing.weightedScore += score;
      } else {
        breakdown.set(key, {
          role: vote.voterRole,
          kind: vote.voteKind,
          count: 1,
          weightedScore: score,
        });
      }

      totalScore += score;
    }

    return {
      roadmapItemId,
      totalScore,
      voteCount: votes.length,
      breakdown: Array.from(breakdown.values()),
    };
  }

  /**
   * Get all votes for a roadmap item
   */
  async getVotes(tenantId: string, roadmapItemId: string): Promise<RoadmapVote[]> {
    return this.votingRepository.findVotes({
      tenantId,
      roadmapItemId,
    });
  }

  /**
   * Get user's vote for a specific roadmap item
   */
  async getUserVote(tenantId: string, roadmapItemId: string, voterMembershipId: string): Promise<RoadmapVote | null> {
    return this.votingRepository.findVote({
      tenantId,
      roadmapItemId,
      voterMembershipId,
    });
  }

  /**
   * Get top voted roadmap items
   */
  async getTopVotedItems(tenantId: string, limit = 10): Promise<Array<{ roadmapItemId: string; score: number }>> {
    const allVotes = await this.votingRepository.findAllVotes({ tenantId });
    
    const scoreMap = new Map<string, number>();
    
    for (const vote of allVotes) {
      const roleWeight = getRoleWeight(vote.voterRole);
      const kindWeight = getKindWeight(vote.voteKind);
      const score = roleWeight * kindWeight;
      
      const currentScore = scoreMap.get(vote.roadmapItemId) || 0;
      scoreMap.set(vote.roadmapItemId, currentScore + score);
    }

    return Array.from(scoreMap.entries())
      .map(([roadmapItemId, score]) => ({ roadmapItemId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}