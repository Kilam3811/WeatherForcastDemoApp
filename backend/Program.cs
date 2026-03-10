using WeatherForecastApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<WeatherService>();

// CORS – allow the Vue dev server and any local production build
builder.Services.AddCors(options =>
{
    options.AddPolicy("VueFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",   // Vite default
                "http://localhost:3000",
                "http://localhost:8080"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("VueFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
