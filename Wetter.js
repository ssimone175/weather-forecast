let tmpl = document.createElement('template');
tmpl.innerHTML = `
<style>
:host{
    max-width: 600px;
    display:block;
    margin-left:auto;
    margin-right:auto;
}
#weather{
    display:flex;
    position: relative;
    flex-wrap: wrap;
    background:var(--background, #fff);
}
.btn-group{
    display: flex;
    justify-content: space-between;
}
.btn-group button{
    border:none;
    width:100%;
    padding:1em;
    font-family: Lato, sans-serif;
    background:var(--background-deactived,#f2f2f2)
}
.btn-group button.active{
    background: var(--background,#fff);
}
daily-forecast{
    background: var(--background,#fff);
    padding:5%;
    box-sizing: border-box;
    display:flex;
    justify-content: center;
    order:2;
}
daily-forecast:not(#show){
    cursor:pointer;
}
daily-forecast.chosen{
    background:var(--background-chosen, #dff0ff);
}
.three daily-forecast:not(#show)
{
    width:33.3%;
}

.five daily-forecast:not(#show)
{
    width:20%;
}

.eight daily-forecast:not(#show)
{
    width:25%;
}

.current daily-forecast:not(#show){
    display:none;
}
daily-forecast#show{
    order:1;
    width:100%!important;
    height:auto;
}
.day{
    text-align: center;
    display:flex;
    width:100%;
    align-items: center;
}
.day .base{
    width: 100%;
}
.day .extra{
    display:none;
}
:host(#show) .day .base{
    width:50%;
}
:host(#show) .day .extra{
    display: block;
    width:50%;
}
.day p{
    margin:0.25em;
    font-size:0.9em;
    text-align: left;
    font-weight: 300;
}
.day p#date{
    text-align:center;
    font-size:1.2em;
    margin-top: -5%;
}
.day img{
    width:100%;
    height:auto;
}
.day img.icon{
    width:30px;
    margin-right:5px;
}
.day .extra p{
    display:flex;
    align-items: center;
}
@media(max-width: 1000px){
    .day p#date{
        font-size:0.9em;
    }
}
@media(max-width:367px){
    .five daily-forecast:not(#show):nth-child(3),
    .five daily-forecast:not(#show):nth-child(4),
    .five daily-forecast:not(#show):nth-child(5),
    .five daily-forecast:not(#show):nth-child(6)
    {
        width:33.3%;
    }
    .five daily-forecast:not(#show):first-child,
    .five daily-forecast:not(#show):nth-child(2),
    .five daily-forecast#show~daily-forecast:not(#show):nth-child(3)
    {
        width:50%;
    }
}
@media(max-width:300px){
    .btn-group{
        font-size:0.9em;
    }
}
</style>
<div class="btn-group">
    <button class="active" id="current">Heute</button>
    <button id="three">3-Tage</button>
    <button id="five">5-Tage</button>
    <button id="eight">8-Tage</button>
</div>
<div id="weather">
</div>`;

function getWeekdayName(number){
    let weekdays = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
    return weekdays[number];
}
class Weather extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
    }
    connectedCallback(){
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + this.lat + "&lon=" + this.lon + "&exclude=hourly,minutely&appid=" + this.apikey + "&units=" + this.units +"&lang=" + this.lang;
        fetch(url)
            .then(response => response.json()).then(res => {this.response = res.daily; this.updateWeather()})
            .catch(err => {
                console.error(err);
            });
        this.days = 1;
        this.shadowRoot.getElementById("weather").setAttribute("class","current");
        this.shadowRoot.querySelector("#current").onclick=(e) =>this.updateDays(e);
        this.shadowRoot.querySelector("#three").onclick=(e) =>this.updateDays(e);
        this.shadowRoot.querySelector("#five").onclick=(e) =>this.updateDays(e);
        this.shadowRoot.querySelector("#eight").onclick=(e) =>this.updateDays(e);
    }
    get lat(){
        return this.getAttribute("lat");}
    set lat(val){
        this.setAttribute("lat",val);}
    get lon(){
        return this.getAttribute("lon");}
    set lon(val){
        this.setAttribute("lon",val);}
    get iconBase(){
        return this.getAttribute("iconBase")||"https://web-components-bachelor.netlify.app/Components/Wetter/"}
    set iconBase(val){
        this.setAttribute("iconBase",val);}
    get apikey(){
        return this.getAttribute("apikey");}
    set apikey(val){
        this.setAttribute("apikey",val);}
    get units(){
        return this.getAttribute("units") || "metric";}
    set units(val){
        this.setAttribute("units",val);}
    get lang(){
        return this.getAttribute("lang") || "en";}
    set lang(val){
        this.setAttribute("lang",val);}
    get exclude(){
        return this.getAttribute("exclude") || [];}
    set exclude(val){
        this.setAttribute("exclude",val);}
    updateDays(e){
        switch(e.target.getAttribute('id')){
            case "current": this.days = 1; break;
            case "three": this.days = 3; break;
            case "five": this.days = 5; break;
            case "eight": this.days = 8; break;
        }
        this.shadowRoot.querySelector(".active").removeAttribute("class");
        e.target.setAttribute("class","active");
        this.shadowRoot.getElementById("weather").setAttribute("class",e.target.getAttribute("id"));
        this.updateWeather()
    }
    updateWeather(){
        let children = this.shadowRoot.getElementById("weather").querySelectorAll("daily-forecast:not(#show)")
        for (let child = children.length-1; child >= this.days ; child --){
            children[child].remove();
        }
        if(children.length < this.days){
            this.loadWeather();
        }
        if(!this.shadowRoot.querySelector("#show") || !this.shadowRoot.querySelector(".chosen")){
            if(this.shadowRoot.querySelector(".chosen")){
                this.shadowRoot.querySelector(".chosen").removeAttribute("class");
            }
            if(this.shadowRoot.querySelector("#show")){
                this.shadowRoot.querySelector("#show").remove();
            }
            let first = this.shadowRoot.querySelector("daily-forecast");
            let clone = first.cloneNode(true);
            first.setAttribute("class","chosen");
            clone.setAttribute("id","show");
            this.shadowRoot.getElementById("weather").appendChild(clone);
        }
    }
    loadWeather(){
        if(this.response){
            for(let i =0; i < this.days; i ++){
                let exists = false;
                for(let child = 0; child < this.shadowRoot.getElementById("weather").childElementCount; child++){
                    if (this.shadowRoot.getElementById("weather").children[child].getAttribute("date") === this.response[i].dt.toString()){
                        exists = true;
                    }
                }
                if(!exists){
                    let forecast = document.createElement("daily-forecast");
                    forecast.setAttribute("icon", this.response[i].weather[0].icon);
                    forecast.setAttribute("weather-text", this.response[i].weather[0].description);
                    forecast.setAttribute("date", this.response[i].dt);
                    forecast.setAttribute("iconBase", this.iconBase);

                    if(!this.exclude.includes("temperature")){
                        forecast.setAttribute("temp-min", this.response[i].temp.min);
                        forecast.setAttribute("temp-max", this.response[i].temp.max);
                    }
                    if(!this.exclude.includes("wind")){
                        forecast.setAttribute("wind", this.response[i].wind_speed);
                    }
                    if(!this.exclude.includes("rain")){
                        forecast.setAttribute("pop", this.response[i].pop);
                        if(this.response[i].rain) forecast.setAttribute("rain", this.response[i].rain);
                        if(this.response[i].snow) forecast.setAttribute("snow", this.response[i].snow);
                    }
                    if(!this.exclude.includes("sun")){
                        forecast.setAttribute("sunrise", this.response[i].sunrise);
                        forecast.setAttribute("sunset", this.response[i].sunset);
                    }
                    forecast.onclick=(e)=>{
                        this.shadowRoot.querySelector(".chosen").removeAttribute("class");
                        this.shadowRoot.getElementById("show").remove();
                        let clone = e.target.cloneNode(true);
                        e.target.setAttribute("class","chosen");
                        clone.setAttribute("id","show");
                        this.shadowRoot.getElementById("weather").appendChild(clone);
                    };
                    this.shadowRoot.getElementById("weather").appendChild(forecast);
                }
            }
        }
    }
}
window.customElements.define('weather-forecast', Weather);
let weather = document.createElement('template');
weather.innerHTML = `
<style>:host{
    max-width: 600px;
    display:block;
    margin-left:auto;
    margin-right:auto;
}
#weather{
    display:flex;
    position: relative;
    flex-wrap: wrap;
    background:var(--background,#fff);
}
.btn-group{
    display: flex;
    justify-content: space-between;
}
.btn-group button{
    border:none;
    width:100%;
    padding:1em;
    font-family: Lato, sans-serif;
    background:var(--background-deactived, #f2f2f2)
}
.btn-group button.active{
    background: var(--background,#fff);
}
daily-forecast{
    background: var(--background,#fff);
    padding:5%;
    box-sizing: border-box;
    display:flex;
    justify-content: center;
    order:2;
}
daily-forecast:not(#show){
    cursor:pointer;
}
daily-forecast.chosen{
    background:var(--background-chosen, #dff0ff);
}
.three daily-forecast:not(#show)
{
    width:33.3%;
}
.five daily-forecast:not(#show)
{
    width:20%;
}
.eight daily-forecast:not(#show)
{
    width:25%;
}
.current daily-forecast:not(#show){
    display:none;
}
daily-forecast#show{
    order:1;
    width:100%!important;
    height:auto;
}
.day{
    text-align: center;
    display:flex;
    width:100%;
    align-items: center;
}
.day .base{
    width: 100%;
}
.day .extra{
    display:none;
}
:host(#show) .day .base{
    width:50%;
}
:host(#show) .day .extra{
    display: block;
    width:50%;
}
.day p{
    margin:0.25em;
    font-size:0.9em;
    text-align: left;
    font-weight: 300;
}
.day p#date{
    text-align:center;
    font-size:1.2em;
    margin-top: -5%;
}
.day img{
    width:100%;
    height:auto;
}
.day img.icon{
    width:30px;
    margin-right:5px;
}
.day .extra p{
    display:flex;
    align-items: center;
}
@media(max-width: 1000px){
    .day p#date{
        font-size:0.9em;
    }
}
@media(max-width:367px){
    .five daily-forecast:not(#show):nth-child(3),
    .five daily-forecast:not(#show):nth-child(4),
    .five daily-forecast:not(#show):nth-child(5),
    .five daily-forecast:not(#show):nth-child(6)
    {
        width:33.3%;
    }
    .five daily-forecast:not(#show):first-child,
    .five daily-forecast:not(#show):nth-child(2),
    .five daily-forecast#show~daily-forecast:not(#show):nth-child(3)
    {
        width:50%;
    }
}
@media(max-width:300px){
    .btn-group{
        font-size:0.9em;
    }
}</style>
<div class="day">
<div class="base">
    <img  id="icon"/>
    <p id="date">No Data</p>
</div>
<div class="extra">
    <p id="weather-text"><img class="icon" id="text-icon" src="rain.svg"/><span>No Data</span></p>
    <p id="temperature"><img class="icon" id="temp-icon" alt="Warm Temperature Icon" src="temperature-warm.svg"/><span>No Data</span></p>
    <p id="rain"><img class="icon" alt="Rain Icon" src="rain.svg"/><span>No Data</span></p>
    <p id="wind"><img class="icon" alt="Wind Icon" src="wind.svg"/><span>No Data</span></p>
    <p id="sunrise"><img class="icon" alt="Sunrise Icon" src="sunrise.svg"/><span>No Data</span></p>
    <p id="sunset"><img class="icon" alt="Sunset Icon" src="sunset.svg"/><span>No Data</span></p>
</div>
</div>`;
class Daily extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(weather.content.cloneNode(true));
    }
    static get observedAttributes() {
        return ['date', 'icon','weather-text', 'pop', 'rain', 'snow', 'temp-min', 'temp-max', 'wind', 'sunrise', 'sunset'];
    }

    get date(){
        return this.getAttribute("date")||" ";}
    get icon(){
        return this.getAttribute("icon")||" ";}
    get weatherText(){
        return this.getAttribute("weather-text")|| " ";}
    get temperature(){
        if(this.getAttribute("temp-min") && this.getAttribute("temp-max")){
            return {min: this.getAttribute("temp-min"),
                max: this.getAttribute("temp-max")};
        }else{
            return undefined;
        }
    }
    get rain(){
        if(this.getAttribute("pop")){
            return{
                pop: parseInt((parseFloat(this.getAttribute("pop")) * 100 )),
                rain: this.getAttribute("rain"),
                snow: this.getAttribute("snow")
            };
        }else return undefined;
    }
    get wind(){
        return this.getAttribute("wind")|| undefined;
    }
    get sun(){
        if(this.getAttribute("sunrise") && this.getAttribute("sunset")){
            return {sunrise: this.getAttribute("sunrise"),
                sunset: this.getAttribute("sunset")};
        }else return undefined;
    }
    get iconBase(){
        return this.getAttribute("iconBase");
    }
    setImages(){
        this.shadowRoot.querySelector("#rain img").setAttribute("src",this.iconBase+"rain.svg");
        this.shadowRoot.querySelector("#wind img").setAttribute("src",this.iconBase+"wind.svg");
        this.shadowRoot.querySelector("#sunrise img").setAttribute("src",this.iconBase+"sunrise.svg");
        this.shadowRoot.querySelector("#sunset img").setAttribute("src",this.iconBase+"sunset.svg");
    }
    setDate(){
        let dt = new Date(parseInt(this.date)*1000);
        this.shadowRoot.getElementById("date").innerText= getWeekdayName(dt.getDay());
    }
    setText(){
        this.shadowRoot.querySelector("#weather-text span").innerText=this.weatherText;
    }
    setIcon(){
        this.shadowRoot.getElementById("icon").setAttribute("src", this.iconBase + this.icon+".png");
        this.shadowRoot.getElementById("icon").setAttribute("alt", this.weatherText);

        this.shadowRoot.getElementById("text-icon").setAttribute("src", this.iconBase + this.icon+".png");
        this.shadowRoot.getElementById("text-icon").setAttribute("alt", this.weatherText);
    }
    setTemp(){
        this.shadowRoot.querySelector("#temperature span").innerText=this.temperature.min+"° / "+ this.temperature.max + "°";
        if(parseFloat(this.temperature.min)<=10){
            this.shadowRoot.getElementById("temp-icon").setAttribute("src",this.iconBase+"temperature-cold.svg");
            this.shadowRoot.getElementById("temp-icon").setAttribute("alt","Cold Temperature Icon");
        }else if(parseFloat(this.temperature.max)>=25){
            this.shadowRoot.getElementById("temp-icon").setAttribute("src",this.iconBase+"temperature-hot.svg");
            this.shadowRoot.getElementById("temp-icon").setAttribute("alt","Hot Temperature Icon");
        }else{
            this.shadowRoot.getElementById("temp-icon").setAttribute("src",this.iconBase+"temperature-warm.svg");
            this.shadowRoot.getElementById("temp-icon").setAttribute("alt","Warm Temperature Icon");
        }
    }
    setRain(){
        let raintext = this.rain.pop + "%";
        if(this.rain.rain){raintext += ", " + this.rain.rain + "mm"};
        if(this.rain.snow){raintext += ", Schnee:" + this.rain.snow + "mm"};
        this.shadowRoot.querySelector("#rain span").innerText= raintext;
    }
    setWind(){
        this.shadowRoot.querySelector("#wind span").innerText=this.wind + "m/s";
    }
    setSun(){
        let sunr = new Date(parseInt(this.sun.sunrise)*1000);
        this.shadowRoot.querySelector("#sunrise span").innerText= sunr.getHours() + ":" + (sunr.getMinutes() <10? "0":"") + sunr.getMinutes();

        let suns = new Date(parseInt(this.sun.sunset)*1000);
        this.shadowRoot.querySelector("#sunset span").innerText= suns.getHours() + ":" + (suns.getMinutes() <10? "0":"")+ suns.getMinutes() ;
    }
    connectedCallback(){
        this.setImages();
        this.setIcon();
        this.setDate();
        this.setText();
        if(this.temperature){
            this.setTemp();
        }else{
            this.shadowRoot.getElementById("temperature").remove();
        }
        if(this.rain){
            this.setRain();
        }else{
            this.shadowRoot.getElementById("rain").remove();
        }
        if(this.wind){
            this.setWind();
        }else{
            this.shadowRoot.getElementById("wind").remove();
        }
        if(this.sun){
            this.setSun();
        }else{
            this.shadowRoot.getElementById("sunrise").remove();
            this.shadowRoot.getElementById("sunset").remove();
        }
    }
    attributeChangedCallback(attrName, oldVal, newVal){
        if((attrName ==="date") && oldVal !== newVal){
            this.setDate();
        }
        if(attrName ==="weather-text" && oldVal !== newVal){
            this.setText();
        }
        if(attrName==="icon"){
            this.setIcon();
        }
        if((attrName ==="pop" || attrName ==="rain" || attrName ==="snow") && oldVal !== newVal && this.rain){
            this.setRain();
        }
        if((attrName ==="temp-min" || attrName ==="temp-max") && oldVal !== newVal && this.temperature){
            this.setTemp();
        }
        if(attrName ==="wind" && oldVal !== newVal && this.wind){
            this.setWind();
        }
        if((attrName ==="sunset" || attrName ==="sunrise") && oldVal !== newVal && this.sun){
            this.setSun();
        }
    }
}
window.customElements.define('daily-forecast', Daily);

