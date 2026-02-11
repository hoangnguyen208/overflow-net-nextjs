namespace VoteService.DTO;

public record UserVotesResult(string TargetId, string TargetType, int VoteValue);