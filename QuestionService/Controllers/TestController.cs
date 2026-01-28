using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuestionService.Controllers;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("errors")]
    public ActionResult GetErrorResponses(int code)
    {
        ModelState.AddModelError("Problem 1", "Validation problem 1");
        ModelState.AddModelError("Problem 2", "Validation problem 2");
        
        return code switch
        {
            400 => BadRequest("This is a bad request"),
            401 => Unauthorized("This is an unauthorized"),
            403 => Forbid(),
            404 => NotFound("This is a not found"),
            500 => Problem("This is an internal server error"),
            _ => ValidationProblem(ModelState)
        };
    }

    [Authorize]
    [HttpGet("auth")]
    public ActionResult TestAuth()
    {
        var user = User.FindFirstValue("name");

        return Ok($"{user} has been authorized!");
    }
}