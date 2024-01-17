// API Key
const apiKey = 'b419a3095b7c0c5b2e554736f5f6fba2';

// API Url
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

$(document).ready(function () {
// Search Form Submission Event
  $('#search-form').submit(function (event) {
    event.preventDefault();
    const cityName = $('#search-input').val().trim();
    if (cityName !== '') {
      $('#search-input').val('');
      getCoordinates(cityName);
    }
  });

// Search Input Keyup Event
  $('#search-input').on('keyup', function () {
    const cityName = $(this).val().trim();
    if (cityName !== '') {
        displaySearches(); 
    }
});

// Main Cities Click Event
  $('#main-cities-list').on('click', '.main-city', function (event) {
    event.preventDefault();
    const cityName = $(this).data('city');
    getCoordinates(cityName);
  });

// Function to display saved searches
const displaySearches = () => {
  const historyList = $('#history');
  historyList.empty();

  let searches = JSON.parse(localStorage.getItem('searches')) || [];
  searches.forEach((search) => {
      const listItem = $('<div class="list-group-item"></div>');
      listItem.text(search);
      listItem.on('click', function () {
          getCoordinates(search);
          $('#search-input').val(search); 
          displaySearches();
      });
      historyList.append(listItem);
  });
};


// Function to get coordinates for a given city
  const getCoordinates = async (city) => {
    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    try {
      const geoResponse = await fetch(geoApiUrl);
      const geoData = await geoResponse.json();
      getCurrentWeather(geoData.coord.lat, geoData.coord.lon, city);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      // Update UI with an error message
      $('#error-message').text('Error fetching coordinates. Please try again.');
    }
  };

// Function to get current weather for a given location
const getCurrentWeather = async (lat, lon, cityName) => {
  const apiCallUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    const response = await fetch(apiCallUrl);
    const data = await response.json();
    console.log('Current Weather Data:', data);
    updateCurrentWeather(data, cityName);
    getFiveDayForecast(lat, lon);
  } catch (error) {
    console.error('Error fetching weather data:', error);
// Update UI with an error message
    $('#error-message').text('Error fetching weather data. Please try again.');
  }
};

// Function to update the current weather information in the UI
const updateCurrentWeather = (data, cityName) => {
  const cityNameElement = $('#city-name');
  const currentDateElement = $('#current-date');
  const weatherIconElement = $('#weather-icon');
  const temperatureElement = $('#temperature');
  const humidityElement = $('#humidity');
  const windSpeedElement = $('#wind-speed');
  const capitalizedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  cityNameElement.text(capitalizedCityName);
  currentDateElement.text(dayjs().format('dddd, MMMM D, YYYY'));

// Check if weather data is available before accessing its properties
  if (data.weather && data.weather.length > 0) {
    weatherIconElement.html(`<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon" />`);
  }

// Check if main data is available before accessing its properties
  if (data.main) {
    const temperatureCelsius = (data.main.temp - 273.15).toFixed(2);
    temperatureElement.text(`Temperature: ${temperatureCelsius} °C`);
    humidityElement.text(`Humidity: ${data.main.humidity}%`);
  }

// Check if wind data is available before accessing its properties
  if (data.wind) {
    windSpeedElement.text(`Wind Speed: ${data.wind.speed} m/s`);
  }
};


// Function to get the 5-day forecast for a given location
  const getFiveDayForecast = async (lat, lon) => {
    const forecastApiUrl = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
      const forecastResponse = await fetch(forecastApiUrl);
      const forecastData = await forecastResponse.json();
      console.log('Forecast Data:', forecastData);
      updateFiveDayForecast(forecastData);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      // Update UI with an error message
      $('#error-message').text('Error fetching forecast data. Please try again.');
    }
  };

// Function to update the 5-day forecast information in the UI
const updateFiveDayForecast = (forecastData) => {
  console.log('Full Forecast Data:', forecastData);

  const forecastContainer = $('#forecast-container');
  forecastContainer.empty();

  const uniqueDays = [];
  const currentDate = dayjs().format('YYYY-MM-DD');

  forecastData.list.forEach((dayData) => {
    const forecastDay = dayjs(dayData.dt_txt).format('YYYY-MM-DD');
    if (!uniqueDays.includes(forecastDay) && forecastDay !== currentDate) {
      uniqueDays.push(forecastDay);

      const dayColumn = $('<div class="col-md-2 weather-box"></div>');
      dayColumn.append(`<h4>${dayjs(forecastDay).format('D/M/YYYY')}</h4>`);
      const temperatureCelsius = (dayData.main.temp - 273.15).toFixed(2);
      dayColumn.append(`<p>Temperature: ${temperatureCelsius} °C</p>`);
      dayColumn.append(`<p>Wind Speed: ${dayData.wind.speed} m/s</p>`);
      dayColumn.append(`<p>Humidity: ${dayData.main.humidity}%</p>`);
      dayColumn.append(`<p><img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="Weather Icon" /></p>`);
      forecastContainer.append(dayColumn);
    }
  });
};


});
