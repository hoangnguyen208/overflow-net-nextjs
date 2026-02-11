namespace VoteService.DTO;

public record CastVoteDto(
    string TargetId,
    string TargetType,
    string TargetUserId,
    string QuestionId,
    int VoteValue
    );