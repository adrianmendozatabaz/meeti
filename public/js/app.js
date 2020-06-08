import {
    OpenStreetMapProvider
} from 'leaflet-geosearch';
import asistencia from './asistencia';

const lat = document.querySelector('#lat').value || 20.1392128;
const lng = document.querySelector('#lng').value || -98.74636799999999;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('map').setView([lat, lng], 15);

let markers = new L.featureGroup().addTo(map);
let marker;
//utilizar el provider y geocoder
var geocodeService = L.esri.Geocoding.geocodeService();

//colocar el pin en edicion
if (lat && lng) {
    //agregar el pin 
    marker = new L.marker([lat, lng], {
            draggable: true,
            autoPan: true
        })
        .addTo(map)
        .bindPopup(direccion)
        .openPopup()

    //asignar al contenedor markers
    markers.addLayer(marker);

    //detectar movimiento del marker
    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.latLng(posicion.lat, posicion.lng));

        //reverse geocoding, cuando el usuario rehubica el pin
        geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
            llenarInputs(result);
            //asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //buscar la direccion
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);

})

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        //si existe un pin anterior limpiarlo
        markers.clearLayers();

        const provider = new OpenStreetMapProvider();

        provider.search({
            query: e.target.value
        }).then((resultado) => {

            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function (error, result) {

                llenarInputs(result)

                //mostrar el mapa 
                map.setView(resultado[0].bounds[0], 15);

                //agregar el pin 
                marker = new L.marker(resultado[0].bounds[0], {
                        draggable: true,
                        autoPan: true
                    })
                    .addTo(map)
                    .bindPopup(resultado[0].label)
                    .openPopup()

                //asignar al contenedor markers
                markers.addLayer(marker);

                //detectar movimiento del marker
                marker.on('moveend', function (e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.latLng(posicion.lat, posicion.lng));

                    //reverse geocoding, cuando el usuario rehubica el pin
                    geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
                        llenarInputs(result);
                        //asigna los valores al popup del marker
                        marker.bindPopup(result.address.LongLabel);
                    });
                })
            })
        })
    }
}

function llenarInputs(resultado) {
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}

/*
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/