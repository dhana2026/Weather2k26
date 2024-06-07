const weatherApi = {
    key: '7293d36ef861c22b6af25c4e9dfb4a38',
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    oneCallUrl: 'https://api.openweathermap.org/data/3.0/onecall'
}

let searchInputBox = document.getElementById('input-box');
searchInputBox.addEventListener('keypress', (event) => {
    if (event.keyCode == 13) {
        getWeatherReport(searchInputBox.value);
    }
})

function getWeatherReport(city) {
    fetch(`${weatherApi.baseUrl}?q=${city}&appid=${weatherApi.key}&units=metric`)
        .then(weather => {
            return weather.json();
        }).then((weather) => {
            if (weather.cod === '400' || weather.cod === '404') {
                handleError(weather.cod);
            } else {
                showWeatherReport(weather);
                getForecast(weather.coord.lat, weather.coord.lon);
                console.log(weather.coord.lat);
                console.log(weather.coord.lon);
            }
        });
}

function getForecast(lat, lon) {
    fetch(`${weatherApi.oneCallUrl}?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${weatherApi.key}&units=metric`)
        .then(response => response.json())
        .then(showForecast);
}

function showWeatherReport(weather) {
    let op = document.getElementById('weather-body');
    op.style.display = 'block';
    let todayDate = new Date();
    op.innerHTML = `
        <div class="location-details">
            <div class="city">${weather.name}, ${weather.sys.country}</div>
            <div class="date">${dateManage(todayDate)}</div>
        </div>
        <div class="weather-status">
            <div class="temp">${Math.round(weather.main.temp)}&deg;C</div>
            <div class="weather">${weather.weather[0].main} <i class="${getIconClass(weather.weather[0].main)}"></i></div>
            <div class="min-max">${Math.floor(weather.main.temp_min)}&deg;C (min) / ${Math.ceil(weather.main.temp_max)}&deg;C (max)</div>
            <div>Updated as of ${getTime(todayDate)}</div>
        </div>
        <hr>
        <div class="day-details">
            <div>Feels like ${weather.main.feels_like}&deg;C | Humidity ${weather.main.humidity}%</div>
            <div>Pressure ${weather.main.pressure} mb | Wind ${weather.wind.speed} KMPH</div>
        </div>
        <div id="forecast-container"></div> <!-- Added a container for the forecast -->
    `;
    changeBg(weather.weather[0].main);
    reset();
}

function showForecast(forecast) {
    let op = document.getElementById('forecast-container');
    let tomorrow = forecast.daily[0];
    let nextWeek = forecast.daily.slice(1, 8);

    op.innerHTML = `
        <div class="forecast">
            <h4>Tomorrow</h4>
            <div class="weather-status">
                <div class="temp">${Math.round(tomorrow.temp.day)}&deg;C</div>
                <div class="weather">${tomorrow.weather[0].main} <i class="${getIconClass(tomorrow.weather[0].main)}"></i></div>
                <div class="min-max">${Math.floor(tomorrow.temp.min)}&deg;C (min) / ${Math.ceil(tomorrow.temp.max)}&deg;C (max)</div>
            </div>
            <hr>
            <h4>Next Week</h4>
            <div class="week-forecast">
                ${nextWeek.map((day, index) => `
                    <div class="day">
                        <div>${index === 0 ? "Tomorrow" : dateManage(new Date(day.dt * 1000))}</div>
                        <div class="weather-status">
                            <div class="temp">${Math.round(day.temp.day)}&deg;C</div>
                            <div class="weather">${day.weather[0].main} <i class="${getIconClass(day.weather[0].main)}"></i></div>
                            <div class="min-max">${Math.floor(day.temp.min)}&deg;C (min) / ${Math.ceil(day.temp.max)}&deg;C (max)</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function handleError(code) {
    if (code === '400') {
        swal("Empty Input", "Please enter a city name", "error");
    } else if (code === '404') {
        swal("Bad Input", "Entered city didn't match any records", "warning");
    }
    reset();
}

function getTime(todayDate) {
    let hour = addZero(todayDate.getHours());
    let minute = addZero(todayDate.getMinutes());
    return `${hour}:${minute}`;
}

function dateManage(dateArg) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let year = dateArg.getFullYear();
    let month = months[dateArg.getMonth()];
    let date = dateArg.getDate();
    let day = days[dateArg.getDay()];
    return `${date} ${month} (${day}), ${year}`;
}

function changeBg(status) {
    let images = {
        Clouds: 'img/clouds.jpg',
        Rain: 'img/rainy.jpg',
        Clear: 'img/clear.jpg',
        Snow: 'img/snow.jpg',
        Sunny: 'img/sunny.jpg',
        Thunderstorm: 'img/thunderstorm.jpg',
        Drizzle: 'img/drizzle.jpg',
        Mist: 'img/mist.jpg',
        Haze: 'img/mist.jpg',
        Fog: 'img/mist.jpg'
    };
    document.body.style.backgroundImage = `url(${images[status] || 'img/bg.jpg'})`;
}

function getIconClass(classarg) {
    let icons = {
        Rain: 'fas fa-cloud-showers-heavy',
        Clouds: 'fas fa-cloud',
        Clear: 'fas fa-cloud-sun',
        Snow: 'fas fa-snowman',
        Sunny: 'fas fa-sun',
        Mist: 'fas fa-smog',
        Thunderstorm: 'fas fa-thunderstorm',
        Drizzle: 'fas fa-thunderstorm'
    };
    return icons[classarg] || 'fas fa-cloud-sun';
}

function reset() {
    document.getElementById('input-box').value = "";
}

function addZero(i) {
    return (i < 10) ? "0" + i : i;
}
