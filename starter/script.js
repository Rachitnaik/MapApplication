'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;


//refactoring

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        //console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`)


        //leaflet code
        const coords = [latitude, longitude]
        map = L.map('map').setView(coords, 13);  // 13 this parameter is about zoom 

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);



        //click event to show marker whereevr we click on map.

        map.on(`click`, function (mapE) {
            mapEvent = mapE;
            form.classList.remove(`hidden`);

            inputDistance.focus();







            /*    const { lat, lng } = mapEvent.latlng;
   
               L.marker([lat, lng]).addTo(map)
                   .bindPopup(L.popup({
                       maxWidth: 250,
                       minWidth: 100,
                       autoClose: false,
                       closeOnClick: false,
                       className: `running-popup`,
   
   
                   }))
                   .setPopupContent('hi')
                   .openPopup(); */
        });


    },

        function () {
            alert(`could not get ur position`);

        })

}

form.addEventListener(`submit`, function (e) {
    e.preventDefault();
    //since mapEvent and map are outside scope , we declared them globally. 
    //clear values
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ``;


    const { lat, lng } = mapEvent.latlng;

    L.marker([lat, lng]).addTo(map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `running-popup`,


        }))
        .setPopupContent('hi')
        .openPopup();

})

//chage running to cycling

inputType.addEventListener(`change`, function () {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`)
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`)
});