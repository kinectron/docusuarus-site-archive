// Set to true if using live kinectron data
var liveData = false;

// p5 canvas 
var myCanvas = null;

// Declare kinectron 
var kinectron = null;

// drawHand variables
var start = 30;
var target = 100;
var diameter = start;
var light = 255;
var dark = 100;
var hueValue = light;
var lerpAmt = 0.3;
var state = 'ascending';

// recorded data variables
var sentTime = Date.now();
var currentFrame = 0;


function setup() {
  myCanvas = createCanvas(500, 500);
  background(0);
  noStroke();

  if (liveData) initKinectron();
}


function draw() {

  if (!liveData) loopRecordedData();
}


function loopRecordedData() {
  
  // send data every 20 seconds 
  if (Date.now() > sentTime + 20) {
    bodyTracked(recorded_skeleton[currentFrame])
    sentTime = Date.now();

    if (currentFrame < recorded_skeleton.length-1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
  }

}

function initKinectron() {
  // Define and create an instance of kinectron
  var kinectronIpAddress = ""; // FILL IN YOUR KINECTRON IP ADDRESS HERE
  kinectron = new Kinectron(kinectronIpAddress);

  // Connect to the ITP microstudio when live
  //kinectron = new Kinectron("kinectron.itp.tsoa.nyu.edu");

  // Connect with application over peer
  kinectron.makeConnection();

  // Request all tracked bodies and pass data to your callback
  kinectron.startTrackedBodies(bodyTracked);

}


function bodyTracked(body) {
  background(0, 20);

  var hands = [];

  // Get all the joints off the tracked body and do something with them
  for(var jointType in body.joints) {
    joint = body.joints[jointType];

    drawJoint(joint);

    // Get the hands off the tracked body and do somethign with them
    
    // Find right hand 
    if (jointType == 11) {
      hands.rightHand = joint;
      hands.rightHandState = translateHandState(body.rightHandState);
    }

    // Find left hand
    if (jointType == 7) {
      hands.leftHand = joint;
      hands.leftHandState = translateHandState(body.leftHandState);
    }

  }

  drawHands(hands);

}

// Draw skeleton
function drawJoint(joint) {
  fill(100);

  // Kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * myCanvas.width, joint.depthY * myCanvas.height, 15, 15);

  fill(200);

  // Kinect location data needs to be normalized to canvas size
  ellipse(joint.depthX * myCanvas.width, joint.depthY * myCanvas.height, 3, 3);
}

// Make handstate more readable
function translateHandState(handState) {
  switch (handState) {
    case 0:
      return 'unknown';

    case 1:
      return 'notTracked';

    case 2:
      return 'open';

    case 3:
      return 'closed';

    case 4:
      return 'lasso';
  }
}


// Draw hands
function drawHands(hands) {

  //check if hands are touching 
  if ((Math.abs(hands.leftHand.depthX - hands.rightHand.depthX) < 0.01) && (Math.abs(hands.leftHand.depthY - hands.rightHand.depthY) < 0.01)) {
    hands.leftHandState = 'clapping';
    hands.rightHandState = 'clapping';
  }

  // draw hand states
  
  updateHandState(hands.leftHandState, hands.leftHand);
  updateHandState(hands.rightHandState, hands.rightHand);
}

// Find out state of hands
function updateHandState(handState, hand) {

  switch (handState) {
    case 'closed':
      drawHand(hand, 1, 255);
      break;

    case 'open':
      drawHand(hand, 0, 255);
      break;

    case 'lasso':
      drawHand(hand, 0, 255);
      break;

      // Created new state for clapping
    case 'clapping':
      drawHand(hand, 1, 'red');
  }
}

// Draw the hands based on their state
function drawHand(hand, handState, color) {

  if (handState === 1) {
    state = 'ascending';
  }

  if (handState === 0) {
    state = 'descending';
  }

  if (state == 'ascending') {
    diameter = lerp(diameter, target, lerpAmt);
    hueValue = lerp(hueValue, dark, lerpAmt);
  }

  if (state == 'descending') {
    diameter = lerp(diameter, start, lerpAmt);
    hueValue = lerp(hueValue, light, lerpAmt);
  }

  fill(color);

  // Kinect location needs to be normalized to canvas size
  ellipse(hand.depthX * myCanvas.width, hand.depthY * myCanvas.height, diameter, diameter);
}