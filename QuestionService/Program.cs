using Common;
using Contract;
using Microsoft.EntityFrameworkCore;
using QuestionService.Data;
using QuestionService.Services;
using Wolverine.EntityFrameworkCore;
using Wolverine.Postgresql;
using Wolverine.RabbitMQ;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<TagService>();
builder.Services.AddKeyCloakAuthentication();

var connectionString = builder.Configuration.GetConnectionString("questionDb");
builder.Services.AddDbContext<QuestionDbContext>(options => options.UseNpgsql(connectionString), optionsLifetime: ServiceLifetime.Singleton);

await builder.UseWolverineWithRabbitMqAsync(options =>
{
    options.ApplicationAssembly = typeof(Program).Assembly;
    options.PersistMessagesWithPostgresql(connectionString!);
    options.UseEntityFrameworkCoreTransactions();
    options.PublishMessage<QuestionCreated>().ToRabbitExchange("Contracts.QuestionCreated").UseDurableOutbox();
    options.PublishMessage<QuestionUpdated>().ToRabbitExchange("Contracts.QuestionUpdated").UseDurableOutbox();
    options.PublishMessage<QuestionDeleted>().ToRabbitExchange("Contracts.QuestionDeleted").UseDurableOutbox();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.MapDefaultEndpoints();

await app.MigrateDbContextsAsync<QuestionDbContext>();

app.Run();