using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Polly;

namespace Common;

public static class MigrationRunner
{
    public static async Task MigrateDbContextsAsync<TContext>(this IHost host) where TContext : DbContext
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var loggerFactory = services.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger(typeof(MigrationRunner));
        try
        {
            var context = services.GetRequiredService<TContext>();
            
            // Retry policy for database connection
            var dbRetryPolicy = Policy.Handle<Exception>()
                .WaitAndRetryAsync(
                    retryCount: 5,
                    sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    onRetry: (exception, timeSpan, retryCount) =>
                    {
                        logger.LogWarning($"Database connection retry {retryCount} failed: {exception.Message}. Waiting {timeSpan.TotalSeconds}s before retry.");
                    });

            await dbRetryPolicy.ExecuteAsync(async () =>
            {
                await context.Database.MigrateAsync();
            });
            
            logger.LogInformation("✅ Migration completed for {Name}", typeof(TContext).Name);
        }
        catch (Exception e)
        {
            logger.LogError(e, "An error occurred while migrating the database.");
            throw;
        }
    }
}