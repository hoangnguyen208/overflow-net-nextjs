using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Common;

public static class AuthExtensions
{
    public static IServiceCollection AddKeyCloakAuthentication(this IServiceCollection service)
    {
        service.AddAuthentication()
            .AddKeycloakJwtBearer("keycloak", "overflow", options =>
            {
                options.RequireHttpsMetadata = false;
                options.Audience = "overflow";
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuers =
                    [
                        "http://localhost:6001/realms/overflow",
                        "http://keycloak/realms/overflow",
                        "http://id.overflow.local/realms/overflow"
                    ],
                    ClockSkew = TimeSpan.Zero
                };
            });
        return service;
    }
}