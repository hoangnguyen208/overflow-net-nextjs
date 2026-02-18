using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var kcPort = builder.ExecutionContext.IsPublishMode ? 80 : 6001;

#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak", kcPort)
    .WithEndpoint("http", e => e.IsExternal = true)
    .WithoutHttpsCertificate()
#pragma warning restore ASPIRECERTIFICATES001
    .WithDataVolume("keycloak-data")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HTTPS_ENABLED", "false")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("KC_HOSTNAME_STRICT_HTTPS", "false")
    .WithEnvironment("KC_PROXY_HEADERS", "xforwarded");


var pgUser = builder.AddParameter("pg-username", secret: true);
var pgPassword = builder.AddParameter("pg-password", secret: true);

var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
    .WithPasswordAuthentication(pgUser, pgPassword);

var typesenseApiKey = builder.AddParameter("typesense-api-key", secret: true);

var typesense = builder.AddContainer("typesense", "typesense/typesense", "29.0")
    .WithVolume("typesense-data", "/data")
    .WithEnvironment("TYPESENSE_DATA_DIR", "/data")
    .WithEnvironment("TYPESENSE_ENABLE_CORS", "true")
    .WithEnvironment("TYPESENSE_API_KEY", typesenseApiKey)
    .WithHttpEndpoint(8108, 8108, name: "typesense");

var typesenseContainer = typesense.GetEndpoint("typesense");

var questionDb = postgres.AddDatabase("questionDb");
var profileDb = postgres.AddDatabase("profileDb");
var statsDb = postgres.AddDatabase("statsDb");
var voteDb = postgres.AddDatabase("voteDb");

var rabbitmq = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin(15672);

var questionService = builder.AddProject<Projects.QuestionService>("question-svc")
    .WithReference(keycloak)
    .WithReference(questionDb)
    .WithReference(rabbitmq)
    .WaitFor(keycloak)
    .WaitFor(questionDb)
    .WaitFor(rabbitmq);

var searchService = builder.AddProject<Projects.SearchService>("search-svc")
    .WithEnvironment("typesense-api-key", typesenseApiKey)
    .WithReference(typesenseContainer)
    .WithReference(rabbitmq)
    .WaitFor(typesense)
    .WaitFor(rabbitmq);

var profileService = builder.AddProject<Projects.ProfileService>("profile-svc")
    .WithReference(keycloak)
    .WithReference(profileDb)
    .WithReference(rabbitmq)
    .WaitFor(keycloak)
    .WaitFor(profileDb)
    .WaitFor(rabbitmq);

var statsService = builder.AddProject<Projects.StatsService>("stats-svc")
    .WithReference(statsDb)
    .WithReference(rabbitmq)
    .WaitFor(statsDb)
    .WaitFor(rabbitmq);

var voteService = builder.AddProject<Projects.VoteService>("vote-svc")
    .WithReference(keycloak)
    .WithReference(voteDb)
    .WithReference(rabbitmq)
    .WaitFor(keycloak)
    .WaitFor(voteDb)
    .WaitFor(rabbitmq);

#pragma warning disable ASPIRECERTIFICATES001
var yarp = builder.AddYarp("gateway").WithConfiguration(yarpBuilder =>
{
    yarpBuilder.AddRoute("/questions/{**catch-all}", questionService);
    yarpBuilder.AddRoute("/test/{**catch-all}", questionService);
    yarpBuilder.AddRoute("/tags/{**catch-all}", questionService);
    yarpBuilder.AddRoute("/search/{**catch-all}", searchService);
    yarpBuilder.AddRoute("/profiles/{**catch-all}", profileService);
    yarpBuilder.AddRoute("/stats/{**catch-all}", statsService);
    yarpBuilder.AddRoute("/votes/{**catch-all}", voteService);
})
.WithoutHttpsCertificate();
#pragma warning restore ASPIRECERTIFICATES001

var webapp = builder.AddJavaScriptApp("webapp", "../webapp")
    .WithReference(keycloak)
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

if (builder.ExecutionContext.IsPublishMode)
{
    rabbitmq.WithVolume("rabbitmq-data", "/var/lib/rabbitmq/mnesia");
    webapp.WithEndpoint(env: "PORT", port: 80, targetPort: 4000, scheme: "http", isExternal: true);
}
else
{
    postgres.RunAsContainer();
    rabbitmq.WithDataVolume("rabbitmq-data");
    webapp.WithHttpEndpoint(env: "PORT", port: 3000, targetPort: 4000);
}

if (builder.Environment.IsDevelopment())
{
    // yarp.WithHostPort(8001);
    keycloak.WithRealmImport("../infra/realms");
}
else
{
    // Comment for Azure deployment, Digital Ocean worked though.
    // ERROR: generating bicep from manifest: configuring ingress for resource gateway: Binding http can't be mapped to main ingress
    // because it has port 8001 defined. main ingress only supports port 80 for http scheme.
    // yarp.WithEnvironment("ASPNETCORE_URLS", "http://*:8001")
    //     .WithEndpoint(port: 8001, scheme: "http", targetPort: 8001, name: "gateway", isExternal: true);

    keycloak.WithEnvironment("KC_HOSTNAME", "https://overflow-id.torohng.site")
        .WithEnvironment("KC_HOSTNAME_BACKCHANNEL_DYNAMIC", "true");
    
    builder.AddContainer("nginx-proxy", "nginxproxy/nginx-proxy", "1.9")
        .WithEndpoint(80, 80, "nginx", isExternal: true)
        .WithEndpoint(443, 443, "nginx-ssl", isExternal: true)
        .WithBindMount("/var/run/docker.sock", "/tmp/docker.sock", true)
        .WithVolume("certs", "/etc/nginx/certs", false)
        // .WithBindMount("../infra/devcerts", "/etc/nginx/certs", true)
        .WithVolume("html", "/usr/share/nginx/html", false)
        .WithVolume("vhost", "/etc/nginx/vhost.d")
        .WithContainerName("nginx-proxy");
    
    builder.AddContainer("nginx-proxy-acme", "nginxproxy/acme-companion", "2.2")
        .WithEnvironment("DEFAULT_EMAIL", "hoangnguyen.vn208@gmail.com")
        .WithEnvironment("NGINX_PROXY_CONTAINER", "nginx-proxy")
        .WithBindMount("/var/run/docker.sock", "/var/run/docker.sock", isReadOnly: true)
        .WithVolume("certs", "/etc/nginx/certs")
        .WithVolume("html", "/usr/share/nginx/html")
        .WithVolume("vhost", "/etc/nginx/vhost.d", false)
        .WithVolume("acme", "/etc/acme.sh");
}

builder.Build().Run();
