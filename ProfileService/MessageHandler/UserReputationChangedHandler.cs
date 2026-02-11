using Contract;
using Microsoft.EntityFrameworkCore;
using ProfileService.Data;

namespace ProfileService.MessageHandler;

public class UserReputationChangedHandler(ProfileDbContext db)
{
    public async Task HandleAsync(UserReputationChanged message)
    {
        await db.UserProfiles.Where(x => x.Id == message.UserId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Reputation, x => x.Reputation + message.Delta));
    }
}