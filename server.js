// server.js
// where your node app starts

// init project
var api = require('littlebits-cloud-http').defaults({ access_token: process.env.ACCESS_TOKEN });
var express = require('express');
var app = express();
var deviceStatus;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('views'));

// Get a list of CloudBit devices from the littleBits API
app.get("/devices", function (request, response) {
  console.log("Getting devices");
  api.devices(function(err, result){
    if (err) console.log(err);
    else {
      console.log(result);
      response.send(result);
    }
  });
});

// Subscribe to on and off events for a CloudBit device
app.post("/device", function (request, response) {
  console.log("Subscribing to events for device: " + request.query.device);
  var device = request.query.device;
  
  // Subscribe to 'on' event: when there is significant voltage jump
  api.subscribe({
    publisher_id: device,
    subscriber_id: process.env.GOMIX_URL+'/on',
    publisher_events: ['amplitude:delta:ignite']
  }, function(err, result){
    if (err) console.log(err);
    else console.log("Successfully subscribed to on events");
  }); 
  
  // Subscribe to 'off' event: when there is significant voltage drop
  api.subscribe({
    publisher_id: device,
    subscriber_id: process.env.GOMIX_URL+'/off',
    publisher_events: ['amplitude:delta:release']
  }, function(err, result){
    if (err) console.log(err);
    else console.log("Successfully subscribed to off events");
  });  
  
  response.sendStatus(200);
});

// Received on event from littleBits API
app.post("/on", function (request, response) {
  console.log("Received on event: deviceStatus=true");
  deviceStatus=true;
});

// Received off event from littleBits API
app.post("/off", function (request, response) {
  console.log("Received off event: deviceStatus=false");
  deviceStatus=false;
});

// Pass the latest device status to the client
app.get("/deviceStatus", function (request, response) {
  response.send(deviceStatus);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});