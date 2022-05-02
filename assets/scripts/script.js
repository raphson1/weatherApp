//global variables
var apiKey = "1ca11eb2eb0a3f14218b80de67213ac5";
var today = moment().format("L")
var searchHistory =[];


$("#searchBtn").on("click", function(event) {
   event.preventDefault();

   var city = $("#enterCity").val().trim();
   currentCondition(city);
   if (!searchHistory.includes(city)) {
       searchHistory.push(city);
       var searchedCity = $(`
           <li class="list-group-item">${city}</li>
           `);
       $("#searchHistory").append(searchedCity);
   };
   
   localStorage.setItem("city", JSON.stringify(searchHistory));
   console.log(searchHistory);
});


function currentCondition(city) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

   fetch(requestUrl)
    .then(function (response) {
       return response.json();
    }).then(function (cityWeatherResponse){
       console.log(cityWeatherResponse)
   
       //when a new city is seached remove the content 
       $("#weatherContent").css("display", "block");
       $("#citydetail").empty();

       var iconCode = cityWeatherResponse.weather[0].icon;
       var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`; 
       // append the temperature, humidity and the wind speed on the browser
       var currentCondition = $(`
       <h2>${cityWeatherResponse.name} ${today} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}"></h2>
       <p> Temp: ${cityWeatherResponse.main.temp} °F </p>
       <p> Humidity : ${cityWeatherResponse.main.humidity} %</p>
       <p> Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
    `)

        $("#citydetail").append(currentCondition)

        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;


       // ultraviolet radiation levels

        var uvQuerryUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        fetch(uvQuerryUrl)
         .then(function(response){
            return response.json();
         }).then(function(uviResponse){
            console.log(uviResponse)
             var uvIndex = uviResponse.value;
             var uvIndexP = (`
             <p>UV Index: 
             <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
             </p>   
             `)
             $("#citydetail").append(uvIndexP)

             futureWeather(lat, lon)

             if (uvIndex >= 0 && uvIndex <= 2) {
               $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
           } else if (uvIndex >= 3 && uvIndex <= 5) {
               $("#uvIndexColor").css("background-color", "#FFF300");
           } else if (uvIndex >= 6 && uvIndex <= 7) {
               $("#uvIndexColor").css("background-color", "#F18B00");
           } else if (uvIndex >= 8 && uvIndex <= 10) {
               $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
           } else {
               $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white"); 
           };  

         })

    });    

}
// 5 days weather 
function futureWeather(lat, lon){
   var futureUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
   fetch(futureUrl)
    .then(function(response){
   return response.json();
   }).then(function(futureResponse){
      console.log(futureResponse);

      $("#fiveDays").empty();
      
      for (var i = 1; i < 6; i++){
         var cityEl = {
            date: futureResponse.daily[i].dt,
            icon: futureResponse.daily[i].weather[0].icon,
            temp: futureResponse.daily[i].temp.day,
            wind: futureResponse.daily[i].wind_speed,
            humidity: futureResponse.daily[i].humidity,
         }
       console.log(cityEl)

       var currentDate = moment.unix(cityEl.date).format("DD/MM/YYYY");
       var iconImg = `<img src="https://openweathermap.org/img/w/${cityEl.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;


       var futureCard = $(`
       <div class="pl-2">
           <div class="card pl-3 pt-3 mb-3 bg-dark text-light" style="width: 12rem;>
               <div class="card-body">
                   <h5>${currentDate}</h5>
                   <p>${iconImg}</p>
                   <p>Temp: ${cityEl.temp} °F</p>
                   <p> wind: ${cityEl.wind}</p>
                   <p>Humidity: ${cityEl.humidity}\%</p>
               </div>
           </div>
       <div>
   `);
   $("#fiveDays").append(futureCard)

      }
   })
}

$(document).on("click", ".list-group-item", function() {
   var listCity = $(this).text();
   currentCondition(listCity);
});


$(document).ready(function() {
   var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

   if (searchHistoryArr !== null) {
       var lastSearchedIndex = searchHistoryArr.length - 1;
       var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
       currentCondition(lastSearchedCity);
       console.log(`Last searched city: ${lastSearchedCity}`);
   }
});

