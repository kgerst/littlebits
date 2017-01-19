var deviceId = '';

$(document).ready(function() {
	$('#deviceSelect').on('change', deviceSelectChange); // set a handler for changes to the drop-down menu
	getDevices();	 // Get a list of devices to populate the drop-down menu
});

// This function is called to populate the drop-down list with devices
function getDevices() {
  $.get('/devices', function(devices) {
    devices.forEach(function(device) {
      var html = '<option value="' + device.id + '">' + device.label + '</option>';
			$('#deviceSelect').append(html);
    });
  });
}

// Drop-down menu selection changed
function deviceSelectChange() {
  deviceId = $('#deviceSelect').val();
	if (deviceId === '') {
	  updateDeviceStatus(null, true); // No device selected, so prompt the user to select one
		return;
	}
	// There is a device selected, so subscribe to its events
	$.post('/device?' + $.param({device: deviceId}), function() {
	  console.log("Sent new device ID: " + deviceId);
	  statusPoll(); // Begin polling the device status
	});
}

// Show the appropriate message based on the device status (true/false/null)
function updateDeviceStatus(deviceOn, nothingSelected) {
	if (deviceOn) { // The device is on
		$('#OnDiv').show();
		$('#OffDiv').hide();
		$('#UnknownDiv').hide();
  	$('#SelectionDiv').hide();
	}
	else if(deviceOn===false) { // The device is off
		$('#OnDiv').hide();		
		$('#OffDiv').show();
		$('#UnknownDiv').hide();
  	$('#SelectionDiv').hide();		
	}
	else {
	  if(nothingSelected){  // There's no device selected
	    $('#OnDiv').hide();		
  		$('#OffDiv').hide();
  		$('#UnknownDiv').hide();
  		$('#SelectionDiv').show();
	  } else {  // There's a device selected, but we've yet to receive an on/off event
  		$('#OnDiv').hide();		
  		$('#OffDiv').hide();
  		$('#UnknownDiv').show();
  		$('#SelectionDiv').hide();
	  }
	}
}

// Poll the server for the latest device status
function statusPoll() {
  $.ajax({
    cache: false,
    dataType: 'json',
    type: "GET",
    url: "/deviceStatus",
    error: function () {
      //don't flood server on error - wait 10 seconds before retrying
      setTimeout(statusPoll, 10*1000);
    },
    success: function (status) {
      updateDeviceStatus(status); // Got device status, updating the UI with it
      if (deviceId !== '') { // Only keep polling if there's a device selected
    	  statusPoll();
	    }
    }
  });
}