// !preview r2d3 data = NULL, container = 'div', options = list(shiny_message_loc = 'my_shiny_app'), dependencies = "d3-jetpack"
const system_font = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

const {
  output_size,
} = options;

const image_size = Object.assign({width: 300, height: 300}, output_size);


const no_camera_message = "Shiny can't get access to cameras. This is a privacy consideration. Make sure you are trying from a secure (https, or localhost) site.";

const is_shiny_app = typeof Shiny !== 'undefined';

// ================================================================
// Setup DOM elements
// ================================================================

// Add flex styling to container so things center align
div.st({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

//const camera_chooser = div.selectAppend('select.camera_chooser')
//  .style('display', 'none');

const no_camera_alert = div.selectAppend('p')
  .text(no_camera_message)
  .st({
    display: 'none',
    maxWidth: '300px',
    color: 'darkred',
    fontWeight: 'bold'
  });

const video_element = div.selectAppend('video')
  .at({
    width: image_size.width,
    height: image_size.height,
    autoplay: true,
    playsinline: true,
  })
  .st({
    width: `${image_size.width}px`,
    height:`${image_size.height}px`,
    objectFit: 'cover',
    maxWidth: '100%',
    maxHeight: '80%',
    marginTop: '0.5rem',
  }).node();

const photo_holder = div.selectAppend('canvas.photo_holder')
   .at(image_size)
   .st({
      width: `${image_size.width}px`,
      height:`${image_size.height}px`,
      display: 'none',
    })
    .node();

// ================================================================
// Camera hookup
// ================================================================

// Look for available cameras
if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  no_camera_alert.style('display', 'block');
  return;
} else {
  // List cameras and microphones.
  navigator.mediaDevices
    .enumerateDevices()
    .then(function(devices) {
      const available_cameras = devices
        .filter(device => device.kind === 'videoinput')
        .map(({deviceId, label}) => ({ id: deviceId, name: label }));

      if(available_cameras.length > 1){
        // Show chooser if we have more than one camera
        camera_chooser
          .style('display', 'block')
          .selectAll('option')
          .data(available_cameras)
          .enter().append('option')
          .attr('value', d => d.id)
          .text(d => d.name);

        camera_chooser
          .on('change', function(d){
            const selected_camera_id = this.value;
            attach_camera_stream(selected_camera_id);
          });
      }
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });
}

// Attach the video stream to the video element and autoplay.
function attach_camera_stream(camera_id = null){

  // Older browsers don't use srcObject but just plain src so check for that.
  const is_new_browser = "srcObject" in video_element;

  // Grab current stream (if any from video element)
  const current_stream = video_element[is_new_browser ? 'srcObject': 'src'];

  // Shut off old stream if it exists
  if (current_stream) {
    current_stream
      .getTracks()
      .forEach(track => track.stop());
  }

  // If no camera specified just go to default
  const request_constraints = { video: image_size };

  // Otherwise, add a desired camera id to constraints object
  if(camera_id){
    request_constraints.video.deviceId = {exact: camera_id};
  }

  // Setup new stream
  navigator.mediaDevices
    .getUserMedia(request_constraints)
    .then(new_stream => {
      video_element[is_new_browser ? 'srcObject': 'src'] = new_stream;
    });
}


// Initiate camera stream to default camera.
attach_camera_stream();
