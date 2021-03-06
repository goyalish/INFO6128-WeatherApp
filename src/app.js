window.addEventListener("DOMContentLoaded", () => { });
var elements = {
  searchButton: null,
  searchbar: null,
  city: null,
  date: null,
  temp: null,
  weather: null,
  hi_low: null,
  locateMe: null,
  see_more: null,
  btnDays: null,
  time: null,
  feels_like: null,
  humidity: null,
  sunrise: null,
  sunset: null,
  homeIcon: null,
  shareBtn: null
}

const hoursElements = {
  hoursList: null,
}

const dailyElements = {
  dayList: null,
}
var weather = {};
var city = "";
var currentTemp = "";
var currentWeather = "";
var coords = {
  latitude: 28.65149799130413,
  longitude: 77.0121996488767
};
document.addEventListener("init", async (e) => {
  //e.currentTarget.URL
  initElements();
  initUI();
  askPermission();
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
  let value = params.page;
  console.log(value);
  if (value == "hourly_forecast") {
    changePage("hours.html")
    return
  } else if (value == "daily_forecast") {
    changePage("forecast.html")
    return
  }
  let currentWeather = await loadCurrentWeather('current_weather')
  if (currentWeather) {
    console.log(currentWeather);
    bindWeatherData(currentWeather)
  }
  if (e.target.id === "home") {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date();
    elements.date.innerHTML = today.toLocaleDateString("en-US", options);
    elements.searchbar.addEventListener('keypress', fetchWeather)
    elements.see_more.addEventListener('click', seeMore)
    elements.locateMe.addEventListener('click', locate)
    elements.btnDays.addEventListener('click', daysForecast)
    elements.shareBtn.addEventListener('click', shareWeather)
  } else if (e.target.id === "hours") {
    console.log("onLine: " +window.navigator.onLine);
    initHoursElements();
    if(window.navigator.onLine) {
      fetchHourlyWeather()
    } else {
      let data = await loadCurrentWeather('hourly_weather')
      if(data) {
        bindHourlyWeather(data)
      }
    }
    
  } else if (e.target.id === "forecast") {
    dailyElements.dayList = document.querySelector("#dayList");
    if(window.navigator.onLine) {
      fetchDailyWeather();
    } else {
      let data = await loadCurrentWeather('daily_weather')
      if(data) {
        bindDailyWeather(data)
      }
    }
  }
});

const shareWeather = () => {
  let message = `City: ${city} \n
  Temperature: ${currentTemp} \n
  Weather: ${currentWeather}` 
  if (navigator.share) {
    navigator.share({
      title: "Today's Weather",
      text: message,
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  }
}

const initHoursElements = () => {
  hoursElements.hoursList = document.querySelector("#hoursList");
}

function createHoursItem(hourData) {
  let item = document.createElement("ons-list-item");
  item.innerHTML = `
  <ons-card class="widget-container">
          <div>
            <div class="top-right">
              <h2 id="time">Time: ${hourData.hours + ":00"}</h2>
              <h1 id="temperature">${hourData.temp}</h1>
              <h2 id="celsius">&degC</h2>
            </div>
            <div class="top-left">
              <img class="weather-icon" src=${hourData.icon}>
            </div>
            <div class="bottom-right">
              <div class="other-details-key">
                <p>Feels Like</p>
                <p>Humidity</p>
              </div>
              <div class="other-details-values">
                <p class="feels-like">${hourData.feels_like}??C</p>
                <p class="humidity">${hourData.humidity}</p>
              </div>
            </div>
          </div>
        </ons-card>
`;
  return item;
}

//icon https://openweathermap.org/img/wn/10d@2x.png

function createDayItem(dayData) {
  let item = document.createElement("ons-list-item");
  item.innerHTML = `
  <ons-card class="widget-container">
          <div>
            <div class="top-right">
              <h2 id="day">${dayData.dayName}</h2>
              <h1 id="temperature">${dayData.temp}</h1>
              <h2 id="celsius">&degC</h2>
            </div>
            <div class="top-left">
              <img class="weather-icon" src=${dayData.icon}>
            </div>
            <div class="bottom-right">
              <div class="other-details-key">
                <p>Feels Like</p>
                <p>Humidity</p>
                <p>Sunrise Time</p>
                <p>Sunset Time</p>
              </div>
              <div class="other-details-values">
                <p class="feels-like">${dayData.feels_like}??C</p>
                <p class="humidity">${dayData.humidity}</p>
                <p class="sunrise-time">${dayData.sunrise}</p>
                <p class="sunset-time">${dayData.sunset}</p>
              </div>
            </div>
          </div>
        </ons-card>
`;
  return item;
}

const daysForecast = () => {
  changePage("forecast.html")
}

const seeMore = () => {
  changePage("hours.html")
}

const onLocateSuccess = (position) => {
  coords = position.coords
  console.log(coords.latitude, coords.longitude);
  fetchWeather({ keyCode: 13 });
};

const errors = {
  1: '[PERMISSION_DENIED] Permission was denied to access location services.',
  2: '[POSITION_UNAVAILABLE] The GPS was not able to determine a location',
  3: '[TIMEOUT] The GPS failed to determine a location within the timeout duration',
};

const onLocateFailure = (error) => {
  console.error('Could not access location services!');
  console.error('errors[error.code]', errors[error.code]);
  console.error('error.message', error.message);
};

const locate = () => {
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by your browser!');
  } else {
    navigator.geolocation.getCurrentPosition(onLocateSuccess, onLocateFailure);
  }
};

const initElements = () => {
  elements.searchbar = document.querySelector("#searchbar")
  elements.city = document.querySelector("#city")
  elements.date = document.querySelector("#date")
  elements.temp = document.querySelector("#temp")
  elements.weather = document.querySelector("#weather")
  elements.hi_low = document.querySelector("#hi-low")
  elements.locateMe = document.querySelector("#locateMe")
  elements.see_more = document.querySelector("#see-more")
  elements.btnDays = document.querySelector("#btnDays");
  elements.time = document.querySelector("#time");
  elements.feels_like = document.querySelector("#feels-like");
  elements.humidity = document.querySelector("#humidity");
  elements.sunrise = document.querySelector("#sunrise-time");
  elements.sunset = document.querySelector("#sunset-time");
  elements.homeIcon = document.querySelector("#homeIcon");
  elements.shareBtn = document.querySelector("#share-btn");
}

const initUI = () => {
  let date = new Date();
  let time = date.getHours() + ":" + date.getMinutes();
  elements.time.innerHTML = "Time: " + time;
}

const serviceWorkerNotify = async (title, msg) => {
  const msgOp = {
    body: msg
  }
  const registration = await navigator.serviceWorker.ready;
  if (registration) return registration.showNotification(title, msgOp);
}

const notifyUser = async (title, msg) => {
  const permission = await askPermission();
  if (permission) {
    const rslt = notify(title, msg);
    console.log('Success!', rslt);
  }
}

// const notify = (title, msg) => new Notification(title, msg);
const notify = (title, msg) => serviceWorkerNotify(title, msg);
const askPermission = async () => {
  // Is Web Notifications available on the browser
  if (!("Notification" in window)) {
    console.error("Notification API is not available on this device!");
    return false;
  }

  // Did the user previously allow notifications
  if (Notification.permission === 'granted') {
    return true;
  }

  // If the user denied or hasn't been asked yet
  if (Notification.permission === 'denied' || Notification.permission === 'default') {
    try {
      // Ask for permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      }
      return false;
    } catch (e) {
      console.error("There was an issue acquiring Notification permissions", e);
      return false;
    }
  }
  return false;
}

const fetchWeather = (any) => {
  // one call https://api.openweathermap.org/data/2.5/onecall?lat=35&lon=139&appid=443d32ef6178b04a1373ff5dc5253bc3&exclude=minutely&units=metric
  //https://api.openweathermap.org/data/2.5/weather?q=delhi&APPID=443d32ef6178b04a1373ff5dc5253bc3&units=metric
  if (any.keyCode == 13) {
    const APP_ID = "443d32ef6178b04a1373ff5dc5253bc3";
    let units = "metric";
    city = any.currentTarget ? any.currentTarget.value : "";
    let url = "https://api.openweathermap.org/data/2.5/weather?q="
      + city + "&APPID=" + APP_ID + "&units=" + units
    if (city == "") {
      url = "https://api.openweathermap.org/data/2.5/weather?lat=" + coords.latitude
        + "&lon=" + coords.longitude
        + city + "&APPID=" + APP_ID + "&units=" + units;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // weather = { ...data };
        currentTemp = parseInt(data.main.temp) + "??C";
        currentWeather = data.weather[0].main;
        bindWeatherData(data)
        notifyUser(elements.city.innerHTML, elements.temp.innerHTML);
        saveCurrentWeather('current_weather', data);
      });
  }
}

const bindWeatherData = (data) => {
  elements.city.innerHTML = data.name;
  elements.temp.innerHTML = parseInt(data.main.temp) + "??C";
  elements.weather.innerHTML = data.weather[0].main;
  elements.hi_low.innerHTML = parseInt(data.main.temp_min) + "??C / "
    + parseInt(data.main.temp_max) + "??C";

  coords = {
    latitude: data.coord.lat,
    longitude: data.coord.lon
  }

  elements.feels_like.innerHTML = parseInt(data.main.feels_like) + "??C";
  elements.humidity.innerHTML = data.main.humidity;

  date = new Date(0);
  date.setUTCSeconds(data.sys.sunrise);
  let sunrise = date.getHours() + ":" + date.getMinutes();

  date = new Date(0);
  date.setUTCSeconds(data.sys.sunset);
  let sunset = date.getHours() + ":" + date.getMinutes();

  elements.sunrise.innerHTML = sunrise;
  elements.sunset.innerHTML = sunset;

  let icon = data.weather[0].icon;
  elements.homeIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

const fetchDailyWeather = () => {
  // days api https://pro.openweathermap.org/data/2.5/forecast/climate?q=delhi&appid=b1b15e88fa797225412429c1c50c122a1&units=metric
  const APP_ID = "b1b15e88fa797225412429c1c50c122a1";
  let units = "metric";
  let url = "https://pro.openweathermap.org/data/2.5/forecast/climate?lat="
    + coords.latitude + "&lon=" + coords.longitude + "&APPID=" + APP_ID + "&units=" + units + "&cnt=7";

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      saveCurrentWeather('daily_weather', data)
      bindDailyWeather(data)
    });
}

const bindDailyWeather = (daysWeather) => {
  if (daysWeather && daysWeather.list) {
    daysWeather.list.forEach(element => {

      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let icon = `https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
      var d = new Date(0);
      d.setUTCSeconds(element.dt)
      var hours = d.getHours();
      let dayName = days[d.getDay()];

      d = new Date(0);
      d.setUTCSeconds(element.sunrise)
      let sunrise = d.getHours() + ":" + d.getMinutes();

      d = new Date(0);
      d.setUTCSeconds(element.sunset)
      let sunset = d.getHours() + ":" + d.getMinutes();
      var dayData = {
        dayName: dayName,
        temp: parseInt(element.temp.day),
        sunrise: sunrise,
        sunset: sunset,
        feels_like: parseInt(element.feels_like.day),
        humidity: element.humidity,
        icon: icon
      }
      dailyElements.dayList.appendChild(createDayItem(dayData));
    });
  }
}

const fetchHourlyWeather = () => {
  //hours api https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=35&lon=139&appid=b1b15e88fa797225412429c1c50c122a1
  const APP_ID = "b1b15e88fa797225412429c1c50c122a1";
  let units = "metric";
  let url = "https://pro.openweathermap.org/data/2.5/forecast/hourly?lat="
    + coords.latitude + "&lon=" + coords.longitude + "&APPID=" + APP_ID + "&units=" + units + "&cnt=12";

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        saveCurrentWeather('hourly_weather', data)
        bindHourlyWeather(data)
      }
    });
}

const bindHourlyWeather = (hourlyWeather) => {
  if (hourlyWeather && hourlyWeather.list) {
    hourlyWeather.list.forEach(element => {
      var d = new Date(0);
      d.setUTCSeconds(element.dt)
      var hours = d.getHours();
      let icon = `https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
      var hourData = {
        hours: hours,
        temp: parseInt(element.main.temp),
        feels_like: parseInt(element.main.feels_like),
        humidity: element.main.humidity,
        icon: icon
      }
      hoursElements.hoursList.appendChild(createHoursItem(hourData));
    });
  }
}

const saveCurrentWeather = async (key, weather) => {
  console.log('saving current weather:', weather);

  try {
    await localforage.setItem(key, weather);
  } catch (e) {
    return console.log('error', e);
  }
  console.log('saving current weather success');
};

const loadCurrentWeather = async (key) => {
  console.log('loading Current Weather');

  try {
    const currentWeather = await localforage.getItem(key);
    if (currentWeather && Object.keys(currentWeather).length !== 0) {
      // weather = { ...currentWeather };
      return currentWeather;
    }
    console.log('loadState success');
  } catch (e) {
    console.log('error loading state', e);
  }
  return null;
};

const changePage = (page, data) => {
  document.querySelector("#navigator").pushPage(page, { data });
};

const popPage = () => document.querySelector("#navigator").popPage();
// Padd the history with an extra page so that we don't exit right away
window.addEventListener('load', () => window.history.pushState({}, ''));
// When the browser goes back a page, if our navigator has more than one page we pop the page and prevent the back event by adding a new page
// Otherwise we trigger a second back event, because we padded the history we need to go back twice to exit the app.
window.addEventListener('popstate', () => {
  const { pages } = document.querySelector("#navigator");
  if (pages && pages.length > 1) {
    popPage();
    window.history.pushState({}, '');
  } else {
    window.history.back();
  }
});
