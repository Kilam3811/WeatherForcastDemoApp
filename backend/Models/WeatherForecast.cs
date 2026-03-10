namespace WeatherForecastApi.Models;

public class WeatherForecast
{
    public DateOnly Date { get; set; }
    public int TemperatureC { get; set; }
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Humidity { get; set; }
    public double WindSpeed { get; set; }
    public string WindDirection { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int ChanceOfRain { get; set; }
}
