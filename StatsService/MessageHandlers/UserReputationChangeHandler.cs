using Contract;
using Marten;
using Wolverine.Attributes;

namespace StatsService.MessageHandlers;

public class UserReputationChangeHandler
{
    [Transactional]
    public static async Task HandleAsync(UserReputationChanged message, IDocumentSession session)
    {
        session.Events.Append(message.UserId, message);
        await session.SaveChangesAsync();
    }
}