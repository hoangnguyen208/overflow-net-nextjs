using Contract;
using Marten;
using Wolverine.Attributes;

namespace StatsService.MessageHandlers;

public class QuestionCreatedHandler
{
    [Transactional]
    public static async Task HandleAsync(QuestionCreated message, IDocumentSession session, CancellationToken ct)
    {
        session.Events.StartStream(message.QuestionId, message);
        await session.SaveChangesAsync(ct);
    }
}