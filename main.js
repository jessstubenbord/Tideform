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
    "GET",
    "https://us1.locationiq.com/v1/reverse.php?key=pk.06cea02dd0a1eeafd2590bf67f230a2c&lat=" +
      lat +
      "&lon=" +
      lng +
      "&format=json",
    true
  );
  xhr.send();
  xhr.onreadystatechange = processRequest;
  xhr.addEventListener("readystatechange", processRequest, false);

  function processRequest(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      city = response.address.city;
      console.log(city);
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
          "09c8d4b6-1c49-11eb-a0ea-0242ac130002-09c8d54c-1c49-11eb-a0ea-0242ac130002",
      },
    }
  )
    .then((response) => response.json())
    .then((jsonData) => {
      todayData = jsonData.data.slice(0, 4);
      console.log(todayData);

      const isoTime = new Date().toISOString();

      function highTide() {
        if (todayData[0].time.split(11, 13) > isoTime) {
          highTide = todayData[0].time.slice(11, 16);
          return (document.querySelector(
            `.highTide`
          ).innerText = `Next high tide: ${highTide}`);
        } else {
          highTide = todayData[2].time.slice(11, 16);
          return (document.querySelector(
            `.highTide`
          ).innerText = `Next high tide: ${highTide}`);
        }
      }

      function lowTide() {
        if (todayData[1].time.slice(11, 13) > isoTime) {
          lowTide = todayData[1].time.slice(11, 16);
          return (document.querySelector(
            `.lowTide`
          ).innerText = `Next low tide: ${lowTide}`);
        } else {
          lowTide = todayData[3].time.slice(11, 16);
          return (document.querySelector(
            `.lowTide`
          ).innerText = `Next low tide: ${lowTide}`);
        }
      }

      highTide();
      lowTide();

      //plot time to eclipse 1 hr 30degree, 1 min 6 degree
      const firstHighTide =
        todayData[0].time.slice(11, 13) * 13 +
        todayData[0].time.slice(11, 13) * 0.22;
      const firstlowTide =
        todayData[1].time.slice(11, 13) * 13 +
        todayData[1].time.slice(11, 13) * 0.22;
      const secondHighTide =
        todayData[2].time.slice(11, 13) * 13 +
        todayData[2].time.slice(11, 13) * 0.22;
      const secondlowTide =
        todayData[3].time.slice(11, 13) * 13 +
        todayData[3].time.slice(11, 13) * 0.22;

      console.log(firstHighTide, firstlowTide, secondHighTide, secondlowTide);

      const ellipse = document.querySelector("#ellipse");
      ellipse.setAttribute("transform", "rotate(5)");
    });
}

// firstHighTide, firstlowTide, secondHighTide, secondlowTide
//convert time to position on 360 circle
//set ellipse to this position
//`id="ellipse" class="st0" cx=145 cy=160 rx=105 ry=133`;
//145, 160, 105, 133
