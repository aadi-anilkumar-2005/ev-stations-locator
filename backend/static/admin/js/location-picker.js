/**
 * OpenStreetMap Location Picker using Leaflet
 * Search via Nominatim, click/drag to set coordinates
 */
(function () {
    'use strict';

    const mapContainer = document.getElementById('locationMap');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    const latDisplay = document.getElementById('latitudeDisplay');
    const lngDisplay = document.getElementById('longitudeDisplay');
    const searchInput = document.getElementById('locationSearch');
    const searchBtn = document.getElementById('searchLocationBtn');

    if (!mapContainer || !latInput || !lngInput) return;

    // Default center (India) - adjust if needed
    const defaultLat = 10.8505;
    const defaultLng = 76.2711;

    let map, marker;
    let initialLat = parseFloat(latInput.value) || defaultLat;
    let initialLng = parseFloat(lngInput.value) || defaultLng;

    function updateCoordinates(lat, lng) {
        lat = Number(lat);
        lng = Number(lng);
        latInput.value = lat;
        lngInput.value = lng;
        if (latDisplay) latDisplay.value = lat;
        if (lngDisplay) lngDisplay.value = lng;
    }

    function setMarkerPosition(lat, lng) {
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { draggable: true })
                .addTo(map)
                .on('dragend', function () {
                    const pos = marker.getLatLng();
                    updateCoordinates(pos.lat, pos.lng);
                });
        }
        updateCoordinates(lat, lng);
        map.setView([lat, lng], map.getZoom());
    }

    function initMap() {
        map = L.map('locationMap').setView([initialLat, initialLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        if (latInput.value && lngInput.value) {
            setMarkerPosition(initialLat, initialLng);
        }
        map.on('click', function (e) {
            const { lat, lng } = e.latlng;
            setMarkerPosition(lat, lng);
        });
    }

    function searchLocation() {
        const query = (searchInput && searchInput.value.trim()) || '';
        if (!query) return;

        const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query);
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';

        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'EVStationsLocator-Admin/1.0'
            }
        })
            .then(r => r.json())
            .then(data => {
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    setMarkerPosition(parseFloat(lat), parseFloat(lon));
                } else {
                    alert('Location not found. Try a different search.');
                }
            })
            .catch(() => alert('Search failed. Please try again.'))
            .finally(() => {
                searchBtn.disabled = false;
                searchBtn.textContent = 'Search';
            });
    }

    if (searchBtn) searchBtn.addEventListener('click', searchLocation);
    if (searchInput) searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchLocation();
        }
    });

    if (typeof L !== 'undefined') {
        initMap();
    } else {
        document.addEventListener('leaflet-loaded', initMap);
    }
})();
