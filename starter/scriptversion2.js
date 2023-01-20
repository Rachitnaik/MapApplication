'use strict';
// refactored code is in here
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


//since mapEvent and map are outside scope , we declared them globally.
let map;
let mapEvent;


class Workout {

    date = new Date();
    id = (Date.now() + ``).slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords; //[lat lng]
        this.distance = distance; // in km
        this.duration = duration; // in  mins


    }

    _setdescription() {

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
         ${months[this.date.getMonth()]} ${this.date.getDate()}`;  //edited here on 20jan

    }

}
class Running extends Workout {
    type = `running`;
    constructor(coords, distance, duration, cadence) { //there was no cadence
        super(coords, distance, duration); //common ones coming to the parent class.
        this.cadence = cadence;
        this.calcPace();
        this._setdescription();
    }
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }


}

class Cycling extends Workout {
    type = `cycling`;
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration); //common ones coming to the parent class.
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setdescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

/* /* const run1 = new Running([39, -12], 5.2, 24, 178);
const cycle1 = new Cycling([39, -12], 27, 95, 523); 

console.log(run1, cycle1); */

//***************************/Application architecture *******************************


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


//refactoring
//all methods of class App getposition,loadmap, showfor,togglelevationfield, networkout. 
class App {
    #map;
    #mapEvent; // map and mapEvent as both private properties;
    #workouts = [];
    constructor() {

        this._getposition();
        form.addEventListener(`submit`, this._newWorkout.bind(this));

        //chage running to cycling

        inputType.addEventListener(`change`, this._toggleElevationField);
    }


    _getposition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), //this takes in the loadmap 


                function () {
                    alert(`could not get ur position`);

                })


    }

    _loadMap(position) {

        //console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        // console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`)


        //leaflet code
        const coords = [latitude, longitude]
        //using as property (map) 
        this.#map = L.map('map').setView(coords, 13);  // 13 this parameter is about zoom 

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);



        //click event to show marker whereevr we click on map.

        this.#map.on(`click`, this._showForm.bind(this));

    }
    _showForm(mapE) {

        this.#mapEvent = mapE;
        form.classList.remove(`hidden`);

        inputDistance.focus();

    }
    _hideForm() {
        //empty

        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ``;
        form.classList.add(`hidden`);
    }

    _toggleElevationField() {

        inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`)
        inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`)
    }

    _newWorkout(e) {
        //for every value or all value is valid
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));


        const allPositive = (...inputs) => inputs.every(inp => inp > 0);


        e.preventDefault();

        //Get Data from form
        const type = inputType.value;
        const distance = +inputDistance.value; // to convert in number
        const duration = +inputDuration.value;

        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        //id workout runnig , create runnig object


        if (type === `running`) {
            const cadence = +inputCadence.value; //+sign because to make the output as string.
            //Check if data is valid
            if (!validInput(distance, duration, cadence) || !allPositive(distance, duration, cadence))


                //this statement needs work
                //this return is show when only one value is put
                return alert(`Input be positive1`);


            workout = new Running([lat, lng], distance, duration, cadence);


        }

        //If workout cycling, create cycling object.
        if (type === `cycling`) {
            const elevation = +inputElevation.value;

            if (!validInput(distance, duration, elevation) || !allPositive(distance, duration))
                return alert(`Input be positive2`);

            workout = new Cycling([lat, lng], distance, duration, elevation);
            //workout = new Cycling(coords, distance, duration, elevation);
        }

        // Add the new object to workout array
        this.#workouts.push(workout);

        // render workout on map as marker
        //const { lat, lng } = this.#mapEvent.latlng;


        this._renderWorkoutMarker(workout);


        //render workout on list

        this._renderWorkout(workout);

        //hide form + clear
        //clear values
        this._hideForm();




    }



    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();

    }

    _renderWorkout(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`}</span> 
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div >
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>




        `;

        if (workout.type === `running`)
            html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;

        if (workout.type === `cycling`)
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            
            
            `;



        form.insertAdjacentHTML(`afterend`, html)  //insert it as a sibling element. 
    }

}




//to get position to exwcute
const app = new App();  //constructor is called app







