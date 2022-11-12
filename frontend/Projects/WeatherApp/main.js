const API_KEY ="ba411d4724504b88cf00a5bfdfef3589"

const DAYS_OF_THE_WEEK = ["sun","mon","tue","wed","thu","fri","sat"]

let selectedCityText;
let selectedCity;

const getCitiesUsingGeoloc = async(searchText)=>{
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`)
    return response.json();
}

const getCurrentWeatherData = async({lat,lon,name:city})=>{
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const url =  lat&&lon? geoUrl : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json();
}

const getHourlyForecast = async({name:city}) => {
    const urlHourly = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    const response = await fetch(urlHourly)
    const data = await response.json()
    return data.list.map(forecast=>{
        const {main: {temp,temp_max, temp_min}, dt,dt_txt,weather:[{description,icon}]} = forecast; //json destructureing/
        return { temp,temp_max,temp_min,dt,dt_txt,description,icon}
    })
}
const formatTemp = (temp)=> `${temp?.toFixed(1)}°`;
const getIconURL = (icon)=> `http://openweathermap.org/img/wn/${icon}@2x.png`
const loadCurrentForecast = ({name,main:{temp,temp_max,temp_min}, weather:[{description}]})=>{
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemp(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H:${formatTemp(temp_max)} L:${formatTemp(temp_min)}`;
}

const loadHourlyForecast = ({main:{temp:tempNow},weather:[{icon:iconNow}]},hourlyForecast) =>{
    const timeFormatter = Intl.DateTimeFormat("en",{
        hour12: true,hour:"numeric"
    }) 
    let datafor12Hours = hourlyForecast.slice(2,14);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTML = `<article>
            <h3 class="time">Now</h3>
            <img class="icon" src="${getIconURL(iconNow)}">
            <p class="hourly-temp">${formatTemp(tempNow)}</p>
        </article>`;
    for(let{temp,icon,dt_txt} of datafor12Hours){
        innerHTML += `<article>
            <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
            <img class="icon" src="${getIconURL(icon)}">
            <p class="hourly-temp">${formatTemp(temp)}</p>
        </article>`
    }
    hourlyContainer.innerHTML = innerHTML;
}

const calculateDayWiseForecast = (hourlyForecast)=>{
    let dayWiseForecast = new Map();
    for(let forecast of hourlyForecast){
        const [date] = forecast.dt_txt.split(" ");
        const dayofTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()]
        if (dayWiseForecast.has(dayofTheWeek)){
            let forecastForThatDay = dayWiseForecast.get(dayofTheWeek);
            forecastForThatDay.push(forecast);
            dayWiseForecast.set(dayofTheWeek,forecastForThatDay);
        } else {
            dayWiseForecast.set(dayofTheWeek,[forecast]);
        }
    }
    for (let [key,value] of dayWiseForecast){
        let minTemp = Math.min(...Array.from(value,val=>val.temp_min));
        let maxTemp = Math.min(...Array.from(value,val=>val.temp_max));

        dayWiseForecast.set(key,{minTemp,maxTemp,icon:value.find(v=>v.icon).icon});
    }
    return dayWiseForecast
}

const loadFiveDayForecast = (hourlyForecast)=>{
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector(".five-day-forecast-container");
    let dayWiseInfo = "";
    //day var is not in array but since arrwy destructureing has only one key it maps to day which we provide and for others 
    //it picks from variable names since more than one are there in them
    Array.from(dayWiseForecast).map(([day,{minTemp,maxTemp,icon}],index)=>{  
        if(index<5){
            dayWiseInfo += `<article class="day-wise-forecast">
            <h3 class="day">${index==0? "today": day}</h3>
            <img class="icon" src="${getIconURL(icon)}" alt="icon">
            <p class="min-temp">${formatTemp(minTemp)}</p>
            <p class="max-temp">${formatTemp(maxTemp)}</p>
        </article>`;
        }
    })
    container.innerHTML = dayWiseInfo;
}

const loadFeelsLike = ({main:{feels_like}}) =>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemp(feels_like);
}
const loadHumidity = ({main:{humidity}}) =>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-val").textContent = `${humidity}%`;
}

const loadData = async()=>{
    const currentWeather = await getCurrentWeatherData(selectedCity);
    loadCurrentForecast(currentWeather);
    getHourlyForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather,hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    loadFiveDayForecast(hourlyForecast)
}

const loadForecastUsingGeoloc = () =>{
    navigator.geolocation.getCurrentPosition(({coords})=>{
        const {latitude:lat,longitude:lon} = coords;
        selectedCity = {lat,lon};
        loadData();
    },error=> {
        selectedCity = {name:"Delhi"};
        loadData();
        console.log(error);

    });
    
}

function debounce(func){
    let timer;
    return(...args) => {
        clearTimeout(timer);
        timer = setTimeout(()=>{
            func.apply(this,args)
        },500);
    }
}

const onSearchChange = async(event)=>{
    let {value} = event.target;
    if (!value){
        selectedCity = null;
        selectedCityText = "";
    }
    if (value && (selectedCityText!=value)){
        const listOfCities = await getCitiesUsingGeoloc(value);
        let options = "";
        for (let {lat,lon,state,country,name} of listOfCities){
            options += `<option data-city-details='${JSON.stringify({lat,lon,name})}' value="${name},${state},${country}"></option>`
        }
        document.querySelector("#cities").innerHTML= options;
        
    }
}

const handleCitySelection = (event)=>{
    selectedCityText = event.target.value
    console.log(selectedCityText)
    let options = document.querySelectorAll("#cities > option");
    console.log(options)
    if (options?.length){
        let selectedOption = Array.from(options).find(opt=> opt.value=== selectedCityText);
        console.log(selectedOption);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log(selectedCity);
        loadData();
    }   
}

const debounceSearch = debounce((event)=> onSearchChange(event))

document.addEventListener("DOMContentLoaded",async()=>{
    loadForecastUsingGeoloc();
    const searchInput = document.querySelector("#search")

    searchInput.addEventListener("input",debounceSearch);
    searchInput.addEventListener("change",handleCitySelection);
})