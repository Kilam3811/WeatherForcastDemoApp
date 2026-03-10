using WeatherForecastApi.Models;

namespace WeatherForecastApi.Services;

public class WeatherService
{
    private static readonly Dictionary<string, (string Country, int BaseTemp, string[] Summaries)> CityData = new(StringComparer.OrdinalIgnoreCase)
    {
        ["New York"]      = ("US", 15, new[] { "Partly Cloudy", "Sunny", "Overcast", "Light Rain", "Clear" }),
        ["London"]        = ("GB", 10, new[] { "Overcast", "Rainy", "Partly Cloudy", "Foggy", "Light Rain" }),
        ["Tokyo"]         = ("JP", 18, new[] { "Sunny", "Clear", "Partly Cloudy", "Humid", "Warm" }),
        ["Sydney"]        = ("AU", 22, new[] { "Sunny", "Clear", "Partly Cloudy", "Breezy", "Warm" }),
        ["Paris"]         = ("FR", 12, new[] { "Partly Cloudy", "Overcast", "Light Rain", "Clear", "Breezy" }),
        ["Berlin"]        = ("DE", 8,  new[] { "Overcast", "Light Rain", "Partly Cloudy", "Cold", "Windy" }),
        ["Dubai"]         = ("AE", 38, new[] { "Sunny", "Hot", "Clear", "Hazy", "Scorching" }),
        ["Toronto"]       = ("CA", 5,  new[] { "Partly Cloudy", "Snowy", "Cold", "Overcast", "Clear" }),
        ["Mumbai"]        = ("IN", 30, new[] { "Humid", "Partly Cloudy", "Sunny", "Hazy", "Warm" }),
        ["São Paulo"]     = ("BR", 25, new[] { "Partly Cloudy", "Sunny", "Light Rain", "Warm", "Breezy" }),
        ["Mexico City"]   = ("MX", 20, new[] { "Partly Cloudy", "Sunny", "Light Rain", "Clear", "Breezy" }),
        ["Cairo"]         = ("EG", 32, new[] { "Sunny", "Hot", "Clear", "Hazy", "Dusty" }),
        ["Moscow"]        = ("RU", -2, new[] { "Snowy", "Cold", "Overcast", "Freezing", "Blizzard" }),
        ["Beijing"]       = ("CN", 14, new[] { "Smoggy", "Partly Cloudy", "Clear", "Windy", "Hazy" }),
        ["Los Angeles"]   = ("US", 24, new[] { "Sunny", "Clear", "Partly Cloudy", "Breezy", "Warm" }),
    };

    private static readonly string[] WindDirections = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };

    private static readonly Dictionary<string, string> SummaryIcons = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Sunny"]         = "☀️",
        ["Clear"]         = "🌙",
        ["Partly Cloudy"] = "⛅",
        ["Overcast"]      = "☁️",
        ["Light Rain"]    = "🌦️",
        ["Rainy"]         = "🌧️",
        ["Thunderstorm"]  = "⛈️",
        ["Snowy"]         = "❄️",
        ["Foggy"]         = "🌫️",
        ["Windy"]         = "🌬️",
        ["Hot"]           = "🔥",
        ["Cold"]          = "🧊",
        ["Humid"]         = "💧",
        ["Hazy"]          = "🌫️",
        ["Breezy"]        = "🍃",
        ["Warm"]          = "🌤️",
        ["Dusty"]         = "🌪️",
        ["Smoggy"]        = "🏙️",
        ["Freezing"]      = "🥶",
        ["Blizzard"]      = "🌨️",
        ["Scorching"]     = "🌡️",
    };

    public IEnumerable<string> GetSupportedCities() => CityData.Keys.Order();

    public CityWeatherResponse? GetForecast(string cityName)
    {
        if (!CityData.TryGetValue(cityName, out var data))
            return null;

        var (country, baseTemp, summaries) = data;
        var random = new Random(cityName.GetHashCode() + DateTime.Today.DayOfYear);

        string currentSummary = summaries[random.Next(summaries.Length)];
        int currentTemp = baseTemp + random.Next(-5, 6);

        var forecast = Enumerable.Range(1, 7).Select(day =>
        {
            var dayRandom = new Random(cityName.GetHashCode() + DateTime.Today.DayOfYear + day * 31);
            string summary = summaries[dayRandom.Next(summaries.Length)];
            int tempC = baseTemp + dayRandom.Next(-8, 9);
            return new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Today.AddDays(day)),
                TemperatureC = tempC,
                Summary = summary,
                Description = GetDescription(summary, tempC),
                Humidity = dayRandom.Next(30, 96),
                WindSpeed = Math.Round(dayRandom.Next(0, 60) + dayRandom.NextDouble(), 1),
                WindDirection = WindDirections[dayRandom.Next(WindDirections.Length)],
                Icon = SummaryIcons.GetValueOrDefault(summary, "🌡️"),
                ChanceOfRain = GetRainChance(summary, dayRandom),
            };
        }).ToList();

        return new CityWeatherResponse
        {
            City = cityName,
            Country = country,
            CurrentTemperatureC = currentTemp,
            CurrentSummary = currentSummary,
            CurrentDescription = GetDescription(currentSummary, currentTemp),
            Humidity = random.Next(30, 96),
            WindSpeed = Math.Round(random.Next(0, 60) + random.NextDouble(), 1),
            WindDirection = WindDirections[random.Next(WindDirections.Length)],
            Icon = SummaryIcons.GetValueOrDefault(currentSummary, "🌡️"),
            Forecast = forecast,
        };
    }

    private static string GetDescription(string summary, int tempC) => summary switch
    {
        "Sunny"         => $"Bright sunshine with a high of {tempC}°C. A great day to be outdoors.",
        "Clear"         => $"Clear skies with a temperature of {tempC}°C. Excellent visibility.",
        "Partly Cloudy" => $"Mix of sun and clouds, {tempC}°C. Pleasant conditions expected.",
        "Overcast"      => $"Cloudy skies throughout the day, {tempC}°C. No rain expected.",
        "Light Rain"    => $"Light showers likely, {tempC}°C. Carry an umbrella.",
        "Rainy"         => $"Heavy rain expected, {tempC}°C. Consider staying indoors.",
        "Snowy"         => $"Snowfall expected, {tempC}°C. Roads may be slippery.",
        "Foggy"         => $"Dense fog advisory in effect, {tempC}°C. Drive with caution.",
        "Hot"           => $"Extremely hot conditions, {tempC}°C. Stay hydrated.",
        "Cold"          => $"Cold temperatures, {tempC}°C. Bundle up before heading out.",
        "Windy"         => $"Strong winds expected, {tempC}°C. Secure loose items.",
        "Thunderstorm"  => $"Severe thunderstorm warning, {tempC}°C. Stay indoors.",
        "Freezing"      => $"Dangerously cold, {tempC}°C. Limit time outdoors.",
        "Blizzard"      => $"Blizzard conditions, {tempC}°C. Avoid all travel.",
        "Scorching"     => $"Extreme heat alert, {tempC}°C. Avoid outdoor activities.",
        _               => $"Conditions: {summary}, {tempC}°C.",
    };

    private static int GetRainChance(string summary, Random random) => summary switch
    {
        "Rainy"         => random.Next(80, 100),
        "Light Rain"    => random.Next(50, 80),
        "Thunderstorm"  => random.Next(85, 100),
        "Snowy"         => random.Next(60, 90),
        "Blizzard"      => random.Next(90, 100),
        "Overcast"      => random.Next(20, 50),
        "Partly Cloudy" => random.Next(10, 30),
        "Foggy"         => random.Next(30, 60),
        _               => random.Next(0, 15),
    };
}
