const axios = require('axios');

const prompt = (question, callback) => {
  let stdin = process.stdin,
  stdout = process.stdout;
  
  stdin.resume();
  stdout.write(question);
  stdin.once( 'data', (data) => {
    callback(data.toString().trim());
  });
};

// prompt user for input, and log result to the console
function ask () { 
  prompt( 'Enter address to continue (enter "exit" or ctrl+C to stop): ', (s) => {
    let userInput = s.toLowerCase().trim();
    if (userInput.toLowerCase().trim() === 'exit') {
      process.exit(0)
    }
    
    let encodedAddress = encodeURIComponent(userInput);
    let geocodeUrl = `http://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

    axios.get(geocodeUrl).then((response) => {
      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Unable to find that address.')
      }

      let address = response.data.results[0].formatted_address;
      let latitude = response.data.results[0].geometry.location.lat;
      let longitude = response.data.results[0].geometry.location.lng;
      console.log('Address: ', address);
      console.log(`Co-ordinates: lat:${latitude}, lng:${longitude}`);
      let weatherUrl = (`https://api.darksky.net/forecast/b45937afe6bb1614aeb7a6b8ae3db84f/${latitude},${longitude}`);
      return axios.get(weatherUrl);
    })
    .then((response) => {
      let summary = response.data.currently.summary;
      let temperature = response.data.currently.temperature;
      let apparentTemperature = response.data.currently.temperature;
      console.log(`It is currently ${summary} and the temperature is ${temperature}. It feels like ${apparentTemperature}.`);
      console.log();

      ask();
    })
    .catch((e) => {
      if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to API servers.');
      } else {
        console.log(e.message);
      }
      
      ask();
    });

  });
};

ask();


