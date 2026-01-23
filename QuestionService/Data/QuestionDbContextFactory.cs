using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace QuestionService.Data;

public class QuestionDbContextFactory : IDesignTimeDbContextFactory<QuestionDbContext>
{
    public QuestionDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<QuestionDbContext>();
        
        // This is ONLY used for design-time/migrations
        // At runtime, Aspire will provide the real connection string
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=questionDb;Username=postgres;Password=postgres");
        
        return new QuestionDbContext(optionsBuilder.Options);
    }
}