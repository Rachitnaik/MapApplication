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

}
class Running extends Workout {
    type = `running`;
    constructor(coords, distance, duration, cadence) { //there was no cadence
        super(coords, distance, duration); //common ones coming to the parent class.
        this.cadence = cadence;
        this.calcPace();
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

        this.#map.on(`click`, this._showForm.bind(this)







            /*    const { lat, lng } = mapEvent.latlng;
   
               L.marker([lat, lng]).addTo(map)
                   .bindPopup(L.popup({
                       maxWidth: 250,
                       minWidth: 100,
                       autoClose: false,
                       closeOnClick: false,
                       className: `-popup`,
   
   
                   }))
                   .setPopupContent('hi')
                   .openPopup(); */
        );


    }
    _showForm(mapE) {

        this.#mapEvent = mapE;
        form.classList.remove(`hidden`);

        inputDistance.focus();

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

        // L.marker([lat, lng]).addTo(this.#map)
        //     .bindPopup(L.popup({
        //         maxWidth: 250,
        //         minWidth: 100,
        //         autoClose: false,
        //         closeOnClick: false,
        //         className: `${type}-popup`,


        //     }))
        //     .setPopupContent('hi')
        //     .openPopup();

        //render workout on list

        //hide form + clear
        //clear values
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ``;



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
            .setPopupContent(`workout`)
            .openPopup();

    }

}

// _renderWorkoutMarker(workout) {
//     L.marker(workout.coords)
//       .addTo(this.#map)
//       .bindPopup(
//         L.popup({
//           maxWidth: 250,
//           minWidth: 100,
//           autoClose: false,
//           closeOnClick: false,
//           className: `${workout.type}-popup`,
//         })
//       )
//       .setPopupContent(
//         `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
//       )
//       .openPopup();
//   }


//to get position to exwcute
const app = new App();  //constructor is called app







