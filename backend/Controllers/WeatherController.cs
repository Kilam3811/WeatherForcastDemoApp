using Microsoft.AspNetCore.Mvc;
using WeatherForecastApi.Services;

namespace WeatherForecastApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeatherController : ControllerBase
{
    private readonly WeatherService _weatherService;

    public WeatherController(WeatherService weatherService)
    {
        _weatherService = weatherService;
    }

    /// <summary>
    /// Returns a list of all supported cities.
    /// </summary>
    [HttpGet("cities")]
    public IActionResult GetCities()
    {
        var cities = _weatherService.GetSupportedCities();
        return Ok(cities);
    }

    /// <summary>
    /// Returns the current conditions and 7-day forecast for the requested city.
    /// </summary>
    [HttpGet("forecast/{city}")]
    public IActionResult GetForecast(string city)
    {
        if (string.IsNullOrWhiteSpace(city))
            return BadRequest(new { error = "City name must not be empty." });

        var result = _weatherService.GetForecast(city);
        if (result is null)
            return NotFound(new { error = $"No weather data found for '{city}'. Try one of the supported cities." });

        return Ok(result);
    }
}
