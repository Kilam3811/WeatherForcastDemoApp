namespace WeatherForecastApi.Models;

public class CityWeatherResponse
{
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int CurrentTemperatureC { get; set; }
    public int CurrentTemperatureF => 32 + (int)(CurrentTemperatureC / 0.5556);
    public string CurrentSummary { get; set; } = string.Empty;
    public string CurrentDescription { get; set; } = string.Empty;
    public int Humidity { get; set; }
    public double WindSpeed { get; set; }
    public string WindDirection { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<WeatherForecast> Forecast { get; set; } = new();
}
