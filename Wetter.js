class Wetter extends HTMLElement {
    constructor() {
        super();
        console.log("Kalender Component registered!");
        this.innerHTML = "<p> Aus diesem Custom Element wird die Wetter Component </p>";
    }
}
window.customElements.define('weather-forecast', Wetter);