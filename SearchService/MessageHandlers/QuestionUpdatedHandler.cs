using System.Text.RegularExpressions;
using Contract;
using SearchService.Models;
using Typesense;

namespace SearchService.MessageHandlers;

public class QuestionUpdatedHandler(ITypesenseClient client)
{
    public async Task HandleAsync(QuestionUpdated message)
    {
        var doc = new SearchQuestion
        {
            Id = message.QuestionId,
            Title = message.Title,
            Content = StripHtmlTags(message.Content),
            Tags = message.Tags.ToArray()
        };
        
        await client.UpdateDocument("questions", doc.Id, doc);
    }
    
    private static string StripHtmlTags(string input)
    {
        return Regex.Replace(input, "<.*?>", string.Empty);
    }
}