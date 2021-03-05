let loadanimation = anime({
  targets: '.item__clippath',
  d:
    'M 378.1,121.2 C 408.4,150 417.2,197.9 411,245.8 404.8,293.7 383.5,341.7 353.4,370.7 303.2,419.1 198.7,427.7 144.5,383.8 86.18,336.5 67.13,221.3 111.9,161 138.6,125 188.9,99.62 240.7,90.92 292.4,82.24 345.6,90.32 378.1,121.2 Z',
  duration: 3000,
  scale: 1.1,
  loop: true,
  direction: 'alternate',
  easing: 'linear',
});

let loadanimationback = anime({
  targets: '.item__deco',
  duration: 3000,
  scale: 0.95,
  loop: true,
  direction: 'alternate',
  easing: 'linear',
});

//Current Time

const time = document.querySelector(`.currentTime`);
const currentTime = new Date().toUTCString();

time.innerText = `Current time: ${currentTime}`;

// Co-ordinates
var city;
var lat;
var lng;

function getCoordinates() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    const crd = pos.coords;
    lat = crd.latitude.toString();
    lng = crd.longitude.toString();
    const coordinates = [lat, lng];
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
    getCity(coordinates);
    return;
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

// City
function getCity(coordinates) {
  const xhr = new XMLHttpRequest();
  lat = coordinates[0];
  lng = coordinates[1];

  xhr.open(
    'GET',
    'https://us1.locationiq.com/v1/reverse.php?key=pk.06cea02dd0a1eeafd2590bf67f230a2c&lat=' +
      lat +
      '&lon=' +
      lng +
      '&format=json',
    true
  );
  xhr.send();
  xhr.onreadystatechange = processRequest;
  xhr.addEventListener('readystatechange', processRequest, false);

  function processRequest(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      city = response.address.city;
      const cityLocation = document.querySelector(`.city`);
      cityLocation.innerText = `Location: ${city}`;
      getTide(lat, lng);
      return;
    }
  }
}

getCoordinates();

//Stormglass tide

var todayData;
var highTide;
var lowTide;

function getTide(lat, lng) {
  fetch(
    `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lng}`,
    {
      headers: {
        Authorization:
          '09c8d4b6-1c49-11eb-a0ea-0242ac130002-09c8d54c-1c49-11eb-a0ea-0242ac130002',
      },
    }
  )
    .then((response) => response.json())
    .then((jsonData) => {
      todayData = jsonData.data.slice(0, 4);
      console.log(todayData);

      const isoTime = new Date().toISOString();

      //figure out the NEXT high and low tide based on the current time
      function highTide() {
        let hightideData = todayData.filter((data) => data.type === 'high');

        if (hightideData[0].time.split(11, 13) > isoTime) {
          highTide = todayData[0].time.slice(11, 16);
          return (document.querySelector(
            `.highTide`
          ).innerText = `Next high tide: ${highTide}`);
        } else {
          highTide = hightideData[1].time.slice(11, 16);
          return (document.querySelector(
            `.highTide`
          ).innerText = `Next high tide: ${highTide}`);
        }
      }

      function lowTide() {
        let lowtideData = todayData.filter((data) => data.type === 'low');

        if (lowtideData[0].time.slice(11, 13) > isoTime) {
          lowTide = todayData[1].time.slice(11, 16);
          return (document.querySelector(
            `.lowTide`
          ).innerText = `Next low tide: ${lowTide}`);
        } else {
          lowTide = lowtideData[1].time.slice(11, 16);
          return (document.querySelector(
            `.lowTide`
          ).innerText = `Next low tide: ${lowTide}`);
        }
      }

      highTide();
      lowTide();

      //first high tide for rotation

      let firstHighTide = todayData
        .find((data) => data.type === 'high')
        .time.slice(11, 13);

      let rotation = firstHighTide * 15;
      runAnimation(rotation);
    });
}

function runAnimation(rotation) {
  anime({
    targets: '.item__clippath',
    d:
      'M 189,80.37 C 232.6,46.67 352.5,67.06 350.9,124.1 349.5,173.4 311.7,168 312.4,248.1 312.9,301.1 382.5,319.2 368.5,379.1 349.4,460.6 137.7,467.5 117.6,386.3 98.68,309.7 171.5,292.2 183.6,240.1 195.7,188.2 123.8,130.7 189,80.37 Z',
    duration: 2500,
    rotate: rotation,
    easing: 'linear',
  });
  anime({
    targets: '.item__deco',
    duration: 2500,
    rotate: rotation * -1,
    elasticity: 400,
    easing: 'easeOutQuad',
    scale: 0.9,
  });
  loadanimation.pause();
  loadanimationback.pause();
}
