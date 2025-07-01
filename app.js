// Weather API Configuration
const weatherApi = {
  key: "4d8fb5b93d4af21d66a2948710284366", // Primary API key
  backupKey: "e9ee79136d634d6e0c2b80773f685dc2", // Backup API key
  baseUrl: "https://api.openweathermap.org/data/2.5/weather",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
  airQualityUrl: "https://api.openweathermap.org/data/2.5/air_pollution"
};

// DOM Elements
const searchInputBox = document.getElementById("input-box");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const refreshBtn = document.getElementById("refresh-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const weatherBody = document.getElementById("weather-body");
const favoritesList = document.getElementById("favorites-list");

// App State
let currentCity = "";
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  updateTime();
  setInterval(updateTime, 1000);
  updateFavoritesList();
});

// Initialize app
function initializeApp() {
  // Event listeners
  searchInputBox.addEventListener("keypress", handleSearch);
  searchBtn.addEventListener("click", () => handleSearch({ keyCode: 13 }));
  locationBtn.addEventListener("click", getCurrentLocation);
  refreshBtn.addEventListener("click", refreshWeather);
  favoriteBtn.addEventListener("click", toggleFavorite);
  
  // Load last searched city or default to Mumbai
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    searchInputBox.value = lastCity;
    getWeatherReport(lastCity);
  } else {
    // Default to Mumbai if no last city
    searchInputBox.value = "Mumbai";
    getWeatherReport("Mumbai");
  }
  
  updateFavoriteButton();
}

// Handle search
function handleSearch(event) {
  if (event.keyCode === 13) {
    const city = searchInputBox.value.trim();
    if (city) {
      getWeatherReport(city);
    }
  }
}

// Get weather report with fallback API key
async function getWeatherReport(city) {
  try {
    showLoading(true);
    hideError();
    
    console.log(`Fetching weather for: ${city}`);
    
    // Try with primary API key first
    let weather = await fetchWeatherData(city, weatherApi.key);
    
    // If primary key fails, try backup key
    if (!weather) {
      console.log('Primary API key failed, trying backup key...');
      weather = await fetchWeatherData(city, weatherApi.backupKey);
    }
    
    if (!weather) {
      throw new Error("All API keys failed. Please try again later.");
    }
    
    console.log('Weather data received:', weather);
    
    // Get forecast data with fallback
    console.log('Fetching forecast data...');
    let forecast = null;
    try {
      const forecastResponse = await fetch(
        `${weatherApi.forecastUrl}?q=${city}&appid=${weatherApi.key}&units=metric`
      );
      
      if (forecastResponse.ok) {
        forecast = await forecastResponse.json();
        console.log('Forecast data received');
      } else {
        console.warn('Forecast API error:', forecastResponse.status);
        // Try with backup key
        const backupForecastResponse = await fetch(
          `${weatherApi.forecastUrl}?q=${city}&appid=${weatherApi.backupKey}&units=metric`
        );
        if (backupForecastResponse.ok) {
          forecast = await backupForecastResponse.json();
          console.log('Forecast data received with backup key');
        }
      }
    } catch (forecastError) {
      console.warn('Forecast fetch error:', forecastError);
    }
    
    // Get air quality data with fallback
    console.log('Fetching air quality data...');
    let airQuality = null;
    try {
      const airQualityResponse = await fetch(
        `${weatherApi.airQualityUrl}?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${weatherApi.key}`
      );
      
      if (airQualityResponse.ok) {
        airQuality = await airQualityResponse.json();
        console.log('Air quality data received');
      } else {
        console.warn('Air quality API error:', airQualityResponse.status);
        // Try with backup key
        const backupAirQualityResponse = await fetch(
          `${weatherApi.airQualityUrl}?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${weatherApi.backupKey}`
        );
        if (backupAirQualityResponse.ok) {
          airQuality = await backupAirQualityResponse.json();
          console.log('Air quality data received with backup key');
        }
      }
    } catch (airQualityError) {
      console.warn('Air quality fetch error:', airQualityError);
    }
    
    showWeatherReport(weather, forecast, airQuality);
    currentCity = city;
    localStorage.setItem('lastCity', city);
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    
    let errorMessage = "Failed to fetch weather data. Please check your connection.";
    
    if (error.message.includes("City not found")) {
      errorMessage = "City not found. Please try again with a different city name.";
    } else if (error.message.includes("Invalid API key")) {
      errorMessage = "API configuration error. Please contact support.";
    } else if (error.message.includes("rate limit")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message.includes("Weather API error")) {
      errorMessage = error.message;
    } else if (error.message.includes("All API keys failed")) {
      errorMessage = "Service temporarily unavailable. Please try again later.";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    showError(errorMessage);
  } finally {
    showLoading(false);
  }
}

// Helper function to fetch weather data with a specific API key
async function fetchWeatherData(city, apiKey) {
  try {
    const weatherResponse = await fetch(
      `${weatherApi.baseUrl}?q=${city}&appid=${apiKey}&units=metric`
    );
    
    console.log(`Weather API response status: ${weatherResponse.status}`);
    
    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json().catch(() => ({}));
      console.error('Weather API error:', errorData);
      
      if (weatherResponse.status === 401) {
        console.log('API key invalid, will try backup key');
        return null;
      } else if (weatherResponse.status === 404) {
        throw new Error("City not found");
      } else if (weatherResponse.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(`Weather API error: ${weatherResponse.status} - ${errorData.message || 'Unknown error'}`);
      }
    }
    
    const weather = await weatherResponse.json();
    
    if (weather.cod === "404") {
      throw new Error("City not found");
    }
    
    return weather;
  } catch (error) {
    if (error.message.includes("City not found")) {
      throw error; // Re-throw city not found errors
    }
    console.error('Fetch error with API key:', error);
    return null;
  }
}

// Show weather report
function showWeatherReport(weather, forecast = null, airQuality = null) {
  console.log('Showing weather report:', { weather, forecast, airQuality });
  
  // Update location
  document.getElementById("city").innerHTML = 
    `<i class="fas fa-map-marker-alt"></i> ${weather.name}, ${weather.sys.country}`;
  
  // Update temperature
  document.getElementById("temp").innerHTML = `${Math.round(weather.main.temp)}°C`;
  
  // Update min/max temperature
  document.getElementById("min-max").innerHTML = 
    `${Math.floor(weather.main.temp_min)}°C / ${Math.ceil(weather.main.temp_max)}°C`;
  
  // Update weather description
  document.getElementById("weather").innerText = weather.weather[0].description;
  
  // Update date
  document.getElementById("date").innerText = formatDate(new Date());
  
  // Update weather icon
  updateWeatherIcon(weather.weather[0].main, weather.weather[0].description);
  
  // Update additional weather details
  updateWeatherDetails(weather);
  
  // Update background based on weather
  updateBackground(weather.weather[0].main);
  
  // Update forecast (with fallback)
  console.log('Processing forecast data:', forecast);
  if (forecast && forecast.list && forecast.list.length > 0) {
    console.log('Forecast data available, updating forecast');
    updateForecast(forecast);
  } else {
    console.log('No forecast data, using fallback');
    updateForecastFallback();
  }
  
  // Update air quality (with fallback)
  console.log('Processing air quality data:', airQuality);
  if (airQuality && airQuality.list && airQuality.list.length > 0) {
    console.log('Air quality data available, updating air quality');
    updateAirQuality(airQuality);
  } else {
    console.log('No air quality data, using fallback');
    updateAirQualityFallback();
  }
  
  // Update sunrise/sunset
  updateSunriseSunset(weather.sys);
  
  // Show weather body
  weatherBody.style.display = 'block';
  
  // Update favorite button
  updateFavoriteButton();
}

// Update weather details
function updateWeatherDetails(weather) {
  // Feels like temperature
  document.getElementById("feels-like").innerText = `${Math.round(weather.main.feels_like)}°C`;
  
  // Humidity
  document.getElementById("humidity").innerText = `${weather.main.humidity}%`;
  
  // Wind speed
  document.getElementById("wind-speed").innerText = `${Math.round(weather.wind.speed * 3.6)} km/h`;
  
  // Visibility
  const visibility = weather.visibility ? (weather.visibility / 1000) : 'N/A';
  document.getElementById("visibility").innerText = visibility === 'N/A' ? 'N/A' : `${visibility} km`;
  
  // Pressure
  document.getElementById("pressure").innerText = `${weather.main.pressure} hPa`;
  
  // UV Index (not available in current API, showing placeholder)
  document.getElementById("uv-index").innerText = 'N/A';
}

// Update forecast with fallback
function updateForecast(forecast) {
  console.log('Updating forecast with data:', forecast);
  
  const forecastContainer = document.getElementById("forecast-container");
  const dailyData = getDailyForecast(forecast.list);
  
  console.log('Daily forecast data:', dailyData);
  
  forecastContainer.innerHTML = '';
  
  if (dailyData.length === 0) {
    console.log('No daily data found, using fallback');
    updateForecastFallback();
    return;
  }
  
  dailyData.slice(0, 5).forEach(day => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    
    const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    const icon = getWeatherIcon(day.weather[0].main);
    const temp = Math.round(day.main.temp);
    
    console.log(`Creating forecast item for ${dayName}: ${temp}°C`);
    
    forecastItem.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-icon"><i class="${icon}"></i></div>
      <div class="forecast-temp">${temp}°C</div>
    `;
    
    forecastContainer.appendChild(forecastItem);
  });
  
  // Update hourly forecast
  updateHourlyForecast(forecast.list);
}

// Fallback for forecast when data is not available
function updateForecastFallback() {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = `
    <div class="forecast-item">
      <div class="forecast-day">Today</div>
      <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
      <div class="forecast-temp">--°C</div>
    </div>
    <div class="forecast-item">
      <div class="forecast-day">Tomorrow</div>
      <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
      <div class="forecast-temp">--°C</div>
    </div>
    <div class="forecast-item">
      <div class="forecast-day">--</div>
      <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
      <div class="forecast-temp">--°C</div>
    </div>
  `;
  
  // Update hourly forecast fallback
  updateHourlyForecastFallback();
}

// Fallback for hourly forecast
function updateHourlyForecastFallback() {
  const hourlyContainer = document.getElementById("hourly-forecast");
  hourlyContainer.innerHTML = `
    <div class="hourly-item">
      <div class="hour">Now</div>
      <div class="hourly-icon"><i class="fas fa-cloud"></i></div>
      <div class="hourly-temp">--°C</div>
    </div>
    <div class="hourly-item">
      <div class="hour">+1h</div>
      <div class="hourly-icon"><i class="fas fa-cloud"></i></div>
      <div class="hourly-temp">--°C</div>
    </div>
    <div class="hourly-item">
      <div class="hour">+2h</div>
      <div class="hourly-icon"><i class="fas fa-cloud"></i></div>
      <div class="hourly-temp">--°C</div>
    </div>
  `;
}

// Get daily forecast (one reading per day)
function getDailyForecast(forecastList) {
  const dailyData = [];
  const seenDays = new Set();
  
  // Group by day and get the noon reading for each day
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    const hour = date.getHours();
    
    // Only add one reading per day, prefer noon (12-15) or morning (9-12) readings
    if (!seenDays.has(dayKey)) {
      seenDays.add(dayKey);
      dailyData.push(item);
    } else {
      // If we already have a reading for this day, replace it if this is a better time
      const existingIndex = dailyData.findIndex(d => 
        new Date(d.dt * 1000).toDateString() === dayKey
      );
      
      if (existingIndex !== -1) {
        const existingHour = new Date(dailyData[existingIndex].dt * 1000).getHours();
        // Prefer readings around noon (12-15) or morning (9-12)
        if ((hour >= 12 && hour <= 15) || (hour >= 9 && hour <= 12)) {
          if (!(existingHour >= 12 && existingHour <= 15)) {
            dailyData[existingIndex] = item;
          }
        }
      }
    }
  });
  
  return dailyData;
}

// Update hourly forecast
function updateHourlyForecast(forecastList) {
  const hourlyContainer = document.getElementById("hourly-forecast");
  
  hourlyContainer.innerHTML = '';
  
  // Show next 8 hours
  forecastList.slice(0, 8).forEach(item => {
    const hourItem = document.createElement('div');
    hourItem.className = 'hourly-item';
    
    const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const icon = getWeatherIcon(item.weather[0].main);
    const temp = Math.round(item.main.temp);
    
    hourItem.innerHTML = `
      <div class="hour">${time}</div>
      <div class="hourly-icon"><i class="${icon}"></i></div>
      <div class="hourly-temp">${temp}°C</div>
    `;
    
    hourlyContainer.appendChild(hourItem);
  });
}

// Update air quality with fallback
function updateAirQuality(airQuality) {
  console.log('Updating air quality with data:', airQuality);
  
  const aqiValue = document.getElementById("aqi-value");
  const aqiDescription = document.getElementById("aqi-description");
  
  if (!airQuality.list || airQuality.list.length === 0) {
    console.log('No air quality data found, using fallback');
    updateAirQualityFallback();
    return;
  }
  
  const aqi = airQuality.list[0].main.aqi;
  console.log('AQI value:', aqi);
  
  aqiValue.innerText = aqi;
  
  let description = "";
  let color = "";
  
  switch(aqi) {
    case 1:
      description = "Good";
      color = "#00e400";
      break;
    case 2:
      description = "Fair";
      color = "#ffff00";
      break;
    case 3:
      description = "Moderate";
      color = "#ff7e00";
      break;
    case 4:
      description = "Poor";
      color = "#ff0000";
      break;
    case 5:
      description = "Very Poor";
      color = "#8f3f97";
      break;
    default:
      description = "No data";
      color = "#cccccc";
  }
  
  console.log(`AQI description: ${description}, color: ${color}`);
  
  aqiValue.style.color = color;
  aqiDescription.innerText = description;
}

// Fallback for air quality when data is not available
function updateAirQualityFallback() {
  const aqiValue = document.getElementById("aqi-value");
  const aqiDescription = document.getElementById("aqi-description");
  
  aqiValue.innerText = "--";
  aqiValue.style.color = "#cccccc";
  aqiDescription.innerText = "Data unavailable";
}

// Update sunrise/sunset
function updateSunriseSunset(sys) {
  const sunriseTime = new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  const sunsetTime = new Date(sys.sunset * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  document.getElementById("sunrise-time").innerText = sunriseTime;
  document.getElementById("sunset-time").innerText = sunsetTime;
}

// Get weather icon
function getWeatherIcon(weatherMain) {
  switch(weatherMain.toLowerCase()) {
    case "clear":
      return "fas fa-sun";
    case "clouds":
      return "fas fa-cloud";
    case "rain":
      return "fas fa-cloud-rain";
    case "snow":
      return "fas fa-snowflake";
    case "thunderstorm":
      return "fas fa-bolt";
    case "drizzle":
      return "fas fa-cloud-drizzle";
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
      return "fas fa-smog";
    default:
      return "fas fa-cloud";
  }
}

// Update weather icon
function updateWeatherIcon(weatherMain, description) {
  const iconElement = document.getElementById("weather-icon");
  const iconClass = getWeatherIcon(weatherMain);
  
  // Add animation class for smooth transition
  iconElement.style.animation = 'none';
  iconElement.offsetHeight; // Trigger reflow
  iconElement.style.animation = null;
  
  iconElement.innerHTML = `<i class="${iconClass}"></i>`;
  
  // Add specific animations for certain weather types
  if (weatherMain.toLowerCase() === "thunderstorm") {
    iconElement.style.animation = "thunder 2s infinite";
  } else if (weatherMain.toLowerCase() === "snow") {
    iconElement.style.animation = "snowfall 3s infinite";
  }
}

// Update background
function updateBackground(weatherType) {
  const body = document.body;
  
  // Remove existing weather classes
  body.classList.remove('clear', 'clouds', 'rain', 'snow', 'sunny', 'thunderstorm', 'smoke');
  
  // Add new weather class
  body.classList.add(weatherType.toLowerCase());
  
  // Add weather animations
  addWeatherAnimations(weatherType);
}

// Add weather animations based on conditions
function addWeatherAnimations(weatherMain) {
  const body = document.body;
  
  // Remove existing animation classes
  body.classList.remove('rain-animation', 'snow-animation', 'wind-animation');
  
  // Add appropriate animations
  switch(weatherMain.toLowerCase()) {
    case "rain":
    case "drizzle":
      body.classList.add('rain-animation');
      break;
    case "snow":
      body.classList.add('snow-animation');
      break;
    case "wind":
      body.classList.add('wind-animation');
      break;
  }
}

// Get current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    showLoading(true);
    hideError();
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get current weather
          const weatherResponse = await fetch(
            `${weatherApi.baseUrl}?lat=${latitude}&lon=${longitude}&appid=${weatherApi.key}&units=metric`
          );
          
          if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
          }
          
          const weather = await weatherResponse.json();
          
          // Get forecast data
          const forecastResponse = await fetch(
            `${weatherApi.forecastUrl}?lat=${latitude}&lon=${longitude}&appid=${weatherApi.key}&units=metric`
          );
          
          let forecast = null;
          if (forecastResponse.ok) {
            forecast = await forecastResponse.json();
          }
          
          // Get air quality data
          const airQualityResponse = await fetch(
            `${weatherApi.airQualityUrl}?lat=${latitude}&lon=${longitude}&appid=${weatherApi.key}`
          );
          
          let airQuality = null;
          if (airQualityResponse.ok) {
            airQuality = await airQualityResponse.json();
          }
          
          showWeatherReport(weather, forecast, airQuality);
          searchInputBox.value = weather.name;
          currentCity = weather.name;
          
        } catch (error) {
          console.error('Error fetching location weather:', error);
          showError("Failed to get weather for your location.");
        } finally {
          showLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        showError("Unable to get your location. Please enable location services.");
        showLoading(false);
      }
    );
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

// Refresh weather
function refreshWeather() {
  if (currentCity) {
    getWeatherReport(currentCity);
  }
}

// Toggle favorite
function toggleFavorite() {
  if (!currentCity) return;
  
  const index = favorites.indexOf(currentCity);
  if (index > -1) {
    favorites.splice(index, 1);
    favoriteBtn.classList.remove('active');
  } else {
    favorites.push(currentCity);
    favoriteBtn.classList.add('active');
  }
  
  localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  updateFavoriteButton();
  updateFavoritesList();
}

// Update favorite button
function updateFavoriteButton() {
  if (favorites.includes(currentCity)) {
    favoriteBtn.classList.add('active');
  } else {
    favoriteBtn.classList.remove('active');
  }
}

// Update favorites list
function updateFavoritesList() {
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<div class="no-favorites">No favorites yet</div>';
    return;
  }
  
  favoritesList.innerHTML = '';
  favorites.forEach(city => {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'favorite-item';
    favoriteItem.innerHTML = `
      <span class="favorite-name">${city}</span>
      <i class="fas fa-times favorite-remove" onclick="removeFavorite('${city}')"></i>
    `;
    
    favoriteItem.addEventListener('click', (e) => {
      if (!e.target.classList.contains('favorite-remove')) {
        searchInputBox.value = city;
        getWeatherReport(city);
      }
    });
    
    favoritesList.appendChild(favoriteItem);
  });
}

// Remove favorite
function removeFavorite(city) {
  const index = favorites.indexOf(city);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    updateFavoriteButton();
    updateFavoritesList();
  }
}

// Show loading state
function showLoading(show) {
  if (show) {
    loading.classList.add('show');
    weatherBody.style.display = 'none';
  } else {
    loading.classList.remove('show');
    weatherBody.style.display = 'block';
  }
}

// Show error message
function showError(message) {
  document.getElementById("error-text").innerText = message;
  errorMessage.classList.add('show');
  weatherBody.style.display = 'none';
}

// Hide error message
function hideError() {
  errorMessage.classList.remove('show');
}

// Show default state
function showDefaultState() {
  weatherBody.style.display = 'block';
  document.getElementById("city").innerHTML = '<i class="fas fa-map-marker-alt"></i> Enter a city';
  document.getElementById("temp").innerText = '--°C';
  document.getElementById("min-max").innerText = '--°C / --°C';
  document.getElementById("weather").innerText = 'Weather';
  document.getElementById("date").innerText = '--';
  
  // Reset weather details
  document.getElementById("feels-like").innerText = '--°C';
  document.getElementById("humidity").innerText = '--%';
  document.getElementById("wind-speed").innerText = '-- km/h';
  document.getElementById("visibility").innerText = '-- km';
  document.getElementById("pressure").innerText = '-- hPa';
  document.getElementById("uv-index").innerText = '--';
  
  // Reset forecast
  document.getElementById("forecast-container").innerHTML = `
    <div class="forecast-item">
      <div class="forecast-day">--</div>
      <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
      <div class="forecast-temp">--°C</div>
    </div>
  `;
  
  // Reset air quality
  document.getElementById("aqi-value").innerText = '--';
  document.getElementById("aqi-description").innerText = 'No data available';
  
  // Reset sunrise/sunset
  document.getElementById("sunrise-time").innerText = '--:--';
  document.getElementById("sunset-time").innerText = '--:--';
  
  // Reset hourly forecast
  document.getElementById("hourly-forecast").innerHTML = `
    <div class="hourly-item">
      <div class="hour">--:--</div>
      <div class="hourly-icon"><i class="fas fa-cloud"></i></div>
      <div class="hourly-temp">--°C</div>
    </div>
  `;
}

// Format date
function formatDate(date) {
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dateNum = date.getDate();
  const year = date.getFullYear();
  
  return `${dateNum} ${month} (${day}), ${year}`;
}

// Update time
function updateTime() {
  const now = new Date();
  document.getElementById("currenttime").innerText = now.toLocaleTimeString();
  document.getElementById("currentdate").innerText = now.toDateString();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + Enter to search
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    handleSearch({ keyCode: 13 });
  }
  
  // Ctrl/Cmd + R to refresh
  if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
    event.preventDefault();
    refreshWeather();
  }
  
  // Ctrl/Cmd + L to get location
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    getCurrentLocation();
  }
});

// Export functions for potential future use
window.WeatherApp = {
  getWeatherReport,
  getCurrentLocation,
  refreshWeather,
  toggleFavorite,
  removeFavorite
};
