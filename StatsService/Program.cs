using Common;
using Contract;
using JasperFx.Events;
using JasperFx.Events.Projections;
using Marten;
using StatsService.Extensions;
using StatsService.Models;
using StatsService.Projections;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
await builder.UseWolverineWithRabbitMqAsync(options =>
{
    options.ApplicationAssembly = typeof(Program).Assembly;
});

var connString = builder.Configuration.GetConnectionString("statsDb")!;
await connString.EnsurePostgresDatabaseExistsAsync();

builder.Services.AddMarten(options =>
{
    options.Connection(connString);
    options.Events.StreamIdentity = StreamIdentity.AsString;
    options.Events.AddEventType(typeof(QuestionCreated));
    options.Events.AddEventType(typeof(UserReputationChanged));
    options.Schema.For<TagDailyUsage>().Index(x => x.Tag).Index(x => x.Date);
    options.Schema.For<UserReputationChanged>().Index(x => x.UserId).Index(x => x.Occurred);
    options.Projections.Add(new TrendingTagsProjection(), ProjectionLifecycle.Inline);
    options.Projections.Add(new TopUserProjection(), ProjectionLifecycle.Inline);

}).UseLightweightSessions();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/stats/trending-tags", async (IQuerySession session) =>
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
    var start = today.AddDays(-6);

    var rows = await session.Query<TagDailyUsage>().Where(x => x.Date >= start && x.Date <= today)
        .Select(x => new { x.Tag, x.Count })
        .ToListAsync();
    
    var top = rows
        .GroupBy(x => x.Tag)
        .Select(x => new { Tag = x.Key, Count = x.Sum(y => y.Count) })
        .OrderByDescending(x => x.Count)
        .Take(5)
        .ToList();
    
    return Results.Ok(top);
});

app.MapGet("/stats/top-users", async (IQuerySession session) =>
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
    var start = today.AddDays(-6);

    var rows = await session.Query<UserDailyReputation>().Where(x => x.Date >= start && x.Date <= today)
        .Select(x => new {x.UserId, x.Delta})
        .ToListAsync();
    
    var top = rows
        .GroupBy(x => x.UserId)
        .Select(x => new { UserId = x.Key, Delta = x.Sum(y => y.Delta) })
        .OrderByDescending(x => x.Delta)
        .Take(5)
        .ToList();
    
    return Results.Ok(top);
});

app.Run();

