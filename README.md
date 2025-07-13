# 🌤️ Modern Weather App - Multi-Column Layout

A beautiful, modern weather application built with HTML, CSS, and JavaScript. Features a stunning glassmorphism design with a multi-column layout that displays all weather information on one screen without scrolling.

<img width="1512" height="831" alt="Screenshot 2025-07-13 at 8 18 10 PM" src="https://github.com/user-attachments/assets/e334631e-4967-4abf-8024-cebe0b736b6d" />


## ✨ Features

### 🎨 **Modern UI/UX**
- **Multi-Column Layout**: Left sidebar, center content, and right sidebar for optimal information display
- **Glassmorphism Design**: Beautiful frosted glass effect with backdrop blur
- **No-Scroll Design**: All information visible on one screen
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Elegant transitions and hover effects
- **Dynamic Backgrounds**: Background changes based on weather conditions
- **Weather Animations**: Rain, snow, and wind effects

### 🌦️ **Comprehensive Weather Information**
- **Current Temperature**: Real-time temperature display with glow effects
- **Min/Max Temperatures**: Daily temperature range
- **Weather Description**: Detailed weather conditions
- **Feels Like Temperature**: Apparent temperature
- **Humidity**: Air moisture percentage
- **Wind Speed**: Current wind velocity in km/h
- **Visibility**: Atmospheric visibility in kilometers
- **Pressure**: Atmospheric pressure in hPa
- **Weather Icons**: Dynamic icons that change with weather conditions

### 📊 **Advanced Weather Data**
- **5-Day Forecast**: Extended weather predictions with daily overview
- **Hourly Forecast**: Next 8 hours of weather predictions
- **Air Quality Index**: Real-time air quality data with color coding
- **Sunrise/Sunset Times**: Daily sun timing information
- **UV Index**: Ultraviolet radiation levels (when available)

### 🔧 **Enhanced Features**
- **Geolocation**: Get weather for your current location
- **Search Functionality**: Search for any city worldwide
- **Favorites System**: Save and manage favorite cities with click-to-load
- **Auto-refresh**: Refresh weather data with one click
- **Error Handling**: Graceful error messages and loading states
- **Local Storage**: Remembers last searched city and favorites
- **Keyboard Shortcuts**: Quick access to common functions
- **Real-time Clock**: Live time and date display

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + Enter`: Search for city
- `Ctrl/Cmd + R`: Refresh weather data
- `Ctrl/Cmd + L`: Get current location weather

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start searching for cities!

### API Key Setup
The app uses the OpenWeatherMap API with a working API key included for demo purposes. The app also includes a backup API key for reliability. For production use:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Replace the API keys in `app.js`:
   ```javascript
   const weatherApi = {
     key: "YOUR_PRIMARY_API_KEY_HERE",
     backupKey: "YOUR_BACKUP_API_KEY_HERE", // Optional backup
     baseUrl: "https://api.openweathermap.org/data/2.5/weather",
     forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
     airQualityUrl: "https://api.openweathermap.org/data/2.5/air_pollution"
   };
   ```

**Note**: The app includes fallback API keys to ensure it works even if one key fails. Mumbai is set as the default city when the app loads for the first time.

## 🎯 Usage

### Layout Overview
- **Left Sidebar**: Weather details, time/date, and favorites
- **Center Content**: Main weather display with search and current conditions
- **Right Sidebar**: 5-day forecast, air quality, sun/moon info, and hourly forecast

### Basic Usage
1. **Search for a City**: Type a city name in the search box and press Enter
2. **Use Current Location**: Click the location button to get weather for your area
3. **Refresh Data**: Click the refresh button to update weather information
4. **Save Favorites**: Click the heart button to add cities to your favorites
5. **Load Favorites**: Click on any favorite city to load its weather

### Weather Details
The app displays comprehensive weather information including:
- Current temperature with visual effects
- Weather condition with appropriate icons
- Detailed metrics (humidity, wind speed, pressure, etc.)
- Min/max temperature range
- 5-day weather forecast
- Hourly weather predictions
- Air quality index with color coding
- Sunrise and sunset times

### Visual Features
- **Dynamic Backgrounds**: Background images change based on weather
- **Weather Animations**: Rain, snow, and wind effects
- **Icon Animations**: Weather icons animate based on conditions
- **Hover Effects**: Interactive elements with smooth transitions
- **Color-coded Air Quality**: Visual indicators for air quality levels

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Font Awesome**: Beautiful icons for weather and UI elements
- **OpenWeatherMap API**: Weather data provider (Current, Forecast, Air Quality)

### Key Features Implementation
- **Multi-Column Layout**: CSS Grid for responsive three-column design
- **Glassmorphism**: CSS backdrop-filter and rgba backgrounds
- **Responsive Design**: CSS Grid and Flexbox with media queries
- **Async Operations**: Modern fetch API with error handling
- **Local Storage**: Browser storage for user preferences
- **Geolocation**: HTML5 Geolocation API integration
- **Multiple API Calls**: Concurrent requests for comprehensive data

### File Structure
```
Weather-App/
├── index.html          # Main HTML file with multi-column layout
├── style.css           # All styles and animations
├── app.js              # JavaScript functionality with enhanced features
├── images/             # Weather background images
│   ├── clear.jpg
│   ├── cloud.jpg
│   ├── rain.jpeg
│   ├── snow.jpg
│   ├── sunny.webp
│   ├── thunderstorm.jpeg
│   └── smoke.avif
└── README.md           # This file
```

## 🎨 Design Features

### Layout Design
- **Three-Column Grid**: Left sidebar (280px), center content (flexible), right sidebar (280px)
- **No-Scroll Design**: All content fits within viewport height
- **Responsive Breakpoints**: Adapts to different screen sizes
- **Glassmorphism Effects**: Semi-transparent panels with backdrop blur

### Color Scheme
- **Primary**: Gradient from #667eea to #764ba2
- **Text**: White and light gray for readability
- **Glass Effect**: Semi-transparent whites with backdrop blur
- **Air Quality Colors**: Green (Good) to Purple (Very Poor)

### Typography
- **Font Family**: Segoe UI with fallbacks
- **Font Weights**: Various weights for hierarchy
- **Text Shadows**: Subtle shadows for depth

### Animations
- **Entrance Animations**: Slide and fade effects
- **Hover Effects**: Scale and transform animations
- **Weather Effects**: Rain, snow, and wind animations
- **Loading States**: Spinner and progress indicators
- **Icon Animations**: Weather-specific icon movements

## 🔧 Customization

### Changing Layout
Modify the CSS custom properties in `style.css`:
```css
:root {
  --sidebar-width: 280px;
  --header-height: 80px;
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* ... other variables */
}
```

### Adding Weather Types
To add support for new weather conditions:
1. Add background images to the `images/` folder
2. Update the `getWeatherIcon()` function in `app.js`
3. Add corresponding CSS classes in `style.css`

### Modifying Animations
All animations are defined in `style.css` using CSS keyframes. You can modify timing, easing, and effects as needed.

## 🌟 New Features Added

### Multi-Column Layout
- **Left Sidebar**: Weather details, time display, favorites management
- **Center Content**: Main weather display with search functionality
- **Right Sidebar**: Forecasts, air quality, sun/moon information

### Enhanced Weather Data
- **5-Day Forecast**: Daily weather predictions
- **Hourly Forecast**: Next 8 hours of detailed weather
- **Air Quality Index**: Real-time air quality with color coding
- **Sunrise/Sunset**: Daily sun timing information

### Improved User Experience
- **No Scrolling Required**: All information visible on one screen
- **Enhanced Favorites**: Click-to-load favorite cities
- **Better Error Handling**: More informative error messages
- **Loading States**: Professional loading animations
- **Responsive Design**: Works on all device sizes

## 📱 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **OpenWeatherMap**: For providing the comprehensive weather APIs
- **Font Awesome**: For the beautiful icons
- **CSS Glassmorphism**: For the design inspiration

---

**Enjoy the weather! ☀️🌧️❄️** 
