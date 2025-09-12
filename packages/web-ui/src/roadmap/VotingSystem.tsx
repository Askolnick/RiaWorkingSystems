'use client';

import React, { useState } from 'react';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';

interface VoteScore {
  roadmapItemId: string;
  totalScore: number;
  voteCount: number;
  breakdown: {
    role: string;
    kind: string;
    count: number;
    weightedScore: number;
  }[];
}

interface UserVote {
  id: string;
  voteKind: 'standard' | 'referenced' | 'expert' | 'expert_referenced';
}

interface VotingSystemProps {
  roadmapItemId: string;
  currentUserVote?: UserVote | null;
  voteScore?: VoteScore | null;
  userRole?: 'super_admin' | 'admin' | 'moderator' | 'member' | 'client_member';
  onVote: (voteKind: 'standard' | 'referenced' | 'expert' | 'expert_referenced') => Promise<void>;
  onRemoveVote?: () => Promise<void>;
  className?: string;
}

const VOTE_KIND_LABELS = {
  standard: 'Vote',
  referenced: 'Referenced Vote',
  expert: 'Expert Vote', 
  expert_referenced: 'Expert Referenced Vote'
};

const VOTE_KIND_DESCRIPTIONS = {
  standard: 'Standard vote',
  referenced: 'Vote with research references (+25% weight)',
  expert: 'Expert domain knowledge (+50% weight)',
  expert_referenced: 'Expert vote with references (+75% weight)'
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator', 
  member: 'Member',
  client_member: 'Client'
};

export function VotingSystem({
  roadmapItemId,
  currentUserVote,
  voteScore,
  userRole = 'member',
  onVote,
  onRemoveVote,
  className = ''
}: VotingSystemProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [showVoteOptions, setShowVoteOptions] = useState(false);

  const handleVote = async (voteKind: 'standard' | 'referenced' | 'expert' | 'expert_referenced') => {
    setIsVoting(true);
    try {
      await onVote(voteKind);
      setShowVoteOptions(false);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!onRemoveVote) return;
    setIsVoting(true);
    try {
      await onRemoveVote();
    } finally {
      setIsVoting(false);
    }
  };

  // Check if user has expert-level permissions
  const canVoteExpert = userRole === 'super_admin' || userRole === 'admin' || userRole === 'moderator';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Vote Score Display */}
      {voteScore && (
        <div className="flex items-center gap-3">
          <Badge variant="info" size="md">
            Score: {voteScore.totalScore.toFixed(1)}
          </Badge>
          <Badge variant="neutral" size="sm">
            {voteScore.voteCount} votes
          </Badge>
        </div>
      )}

      {/* Voting Actions */}
      <div className="flex items-center gap-2">
        {currentUserVote ? (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              Your vote: {VOTE_KIND_LABELS[currentUserVote.voteKind]}
            </Badge>
            {onRemoveVote && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveVote}
                disabled={isVoting}
              >
                Remove Vote
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoteOptions(!showVoteOptions)}
              disabled={isVoting}
            >
              Change Vote
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowVoteOptions(!showVoteOptions)}
            disabled={isVoting}
          >
            Vote on this item
          </Button>
        )}
      </div>

      {/* Vote Options */}
      {showVoteOptions && (
        <Card className="p-4 space-y-3">
          <h4 className="font-medium">Choose your vote type:</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full text-left justify-start"
              onClick={() => handleVote('standard')}
              disabled={isVoting}
            >
              <div>
                <div className="font-medium">{VOTE_KIND_LABELS.standard}</div>
                <div className="text-sm text-gray-600">{VOTE_KIND_DESCRIPTIONS.standard}</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full text-left justify-start"
              onClick={() => handleVote('referenced')}
              disabled={isVoting}
            >
              <div>
                <div className="font-medium">{VOTE_KIND_LABELS.referenced}</div>
                <div className="text-sm text-gray-600">{VOTE_KIND_DESCRIPTIONS.referenced}</div>
              </div>
            </Button>

            {canVoteExpert && (
              <>
                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => handleVote('expert')}
                  disabled={isVoting}
                >
                  <div>
                    <div className="font-medium">{VOTE_KIND_LABELS.expert}</div>
                    <div className="text-sm text-gray-600">{VOTE_KIND_DESCRIPTIONS.expert}</div>
                  </div>
                </Button>

                <Button
                  variant="outline"  
                  className="w-full text-left justify-start"
                  onClick={() => handleVote('expert_referenced')}
                  disabled={isVoting}
                >
                  <div>
                    <div className="font-medium">{VOTE_KIND_LABELS.expert_referenced}</div>
                    <div className="text-sm text-gray-600">{VOTE_KIND_DESCRIPTIONS.expert_referenced}</div>
                  </div>
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoteOptions(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </Card>
      )}

      {/* Vote Breakdown */}
      {voteScore && voteScore.breakdown.length > 0 && (
        <Card className="p-3">
          <h5 className="text-sm font-medium mb-2">Vote Breakdown:</h5>
          <div className="space-y-1">
            {voteScore.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {ROLE_LABELS[item.role as keyof typeof ROLE_LABELS]} - {VOTE_KIND_LABELS[item.kind as keyof typeof VOTE_KIND_LABELS]}
                </span>
                <span>{item.count}×{item.weightedScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}