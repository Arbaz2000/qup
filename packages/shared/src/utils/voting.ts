import { UserRole, ROLE_WEIGHTS } from '../constants/roles';

export function calculateVoteWeight(userRole: UserRole): number {
  return ROLE_WEIGHTS[userRole] || 1;
}

export function calculateTotalVotes(votes: Array<{ type: 'UP' | 'DOWN'; weight: number }>): number {
  return votes.reduce((total, vote) => {
    return total + (vote.type === 'UP' ? vote.weight : -vote.weight);
  }, 0);
}

export function canVote(
  userId: string,
  targetId: string,
  existingVotes: Array<{ userId: string; type: 'UP' | 'DOWN' }>
): boolean {
  const existingVote = existingVotes.find(vote => vote.userId === userId);
  return !existingVote; // Can't vote twice on same target
}
