navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
if (!navigator.vibrate) {
  alert('Your browser does not support the HTML5 vibration API.');
  throw new Error('no vibration support');
}

var vid = document.getElementById('videoel');

/********** check and set up video/webcam **********/

function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.disabled = null;

  vid.play();
}

/*var insertAltVideo = function(video) {
  if (supports_video()) {
    if (supports_ogg_theora_video()) {
      video.src = "/media/cap12_edit.ogv";
    } else if (supports_h264_baseline_video()) {
      video.src = "/media/cap12_edit.mp4";
    } else {
      return false;
    }
    //video.play();
    return true;
  } else return false;
}*/
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
  // set up stream

  var videoSelector = {video : true};
  if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (chromeVersion < 20) {
      videoSelector = "video";
    }
  };

  navigator.getUserMedia(videoSelector, function( stream ) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
    //insertAltVideo(vid);
    alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
  });
} else {
  //insertAltVideo(vid);
  alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
}

vid.addEventListener('canplay', enablestart, false);

/*********** setup of vibration *************/

/*
 * The vibration code runs on a loop in blocks of VIBRATION_BLOCK ms.
 * Each block, it reads the current maximum emotion, then runs that
 * pattern via the HTML5 vibration API.
 */
var VIBRATION_BLOCK = 1500;
var vibrationPattern = null;
var vibrationTimeout = null;

var DUTY_CYCLE = 10;
function pwm(duration, power) {
  if (power === 0) {
    return 0;
  } else if (power === 1) {
    return [duration];
  }
  var pattern = [];
  var on = Math.round(power * DUTY_CYCLE);
  for (var i = 0; i < duration; i += DUTY_CYCLE) {
    pattern.push(on);
    pattern.push(DUTY_CYCLE - on);
  }
  return pattern;
}

function jumpy(duration) {
  var pattern = [];
  var total = 0;
  while (total < VIBRATION_BLOCK) {
    var off = Math.min(100 + Math.round(Math.random() * 400), VIBRATION_BLOCK - total);
    pattern.push(off);
    total += off;
    var on = Math.min(75 + Math.round(Math.random() * 150), VIBRATION_BLOCK - total);
    if (on > 0) {
      pattern.push(on);
      total += on;
    }
  }
  return pattern;
}

function getVibrationPattern(emotion) {
  if (emotion === 'angry') {
    return pwm(VIBRATION_BLOCK, 1);
  } else if (emotion === 'sad') {
    return pwm(VIBRATION_BLOCK, 0.5);
  } else if (emotion === 'surprised') {
    return jumpy(VIBRATION_BLOCK);
  } else {
    return pwm(VIBRATION_BLOCK, 0);
  }
}

function vibrationLoop() {
  vibrationTimeout = setTimeout(vibrationLoop, VIBRATION_BLOCK);
  setPlayIcon(maxEmotion);
  var pattern = getVibrationPattern(maxEmotion);
  console.log('vibrate', pattern);
  navigator.vibrate(pattern);
}

/*********** setup of emotion detection *************/

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);


/*
 * We use exponential rolling decay for emotions, to reduce impact of noise
 * from the classifier.
 */
var HALF_LIFE = 1000;
var start = null;
var last = null;
var maxEmotion = null;
var emotions = {};

/*
 * Storing this allows us to stop the animation loop on demand.
 */
var animRequest = null;

function startTracking() {
  if (vibrationTimeout === null) {
    vibrationTimeout = setTimeout(vibrationLoop, 0);
  }
  if (animRequest === null) {
    ctrack.start(vid);
    start = null;
    last = null;
    emotions = {};
    animRequest = requestAnimFrame(loop);
    setPlayIcon("meh");
  }
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "stop";
  startbutton.onclick = stopTracking;
}

function stopTracking() {
  if (vibrationTimeout !== null) {
    clearTimeout(vibrationTimeout);
    vibrationTimeout = null;
  }
  if (animRequest !== null) {
    ctrack.stop();
    cancelRequestAnimFrame(animRequest);
    animRequest = null;
    setPlayIcon("");
  }
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.onclick = startTracking;
}

function getEmotionMap(er) {
  var emotions = {};
  er.forEach(function(entry) {
    emotions[entry.emotion] = entry.value;
  });
  return emotions;
}

function getMaxEmotion(emotions) {
  var maxEmotion = null;
  var maxValue = -Infinity;
  for (var emotion in emotions) {
    if (emotions.hasOwnProperty(emotion) && emotions[emotion] > maxValue) {
      maxEmotion = emotion;
      maxValue = emotions[emotion];
    }
  }
  return maxEmotion;
}

function blendEmotions(e1, e2, elapsed) {
  var factor = Math.pow(0.5, elapsed / HALF_LIFE);
  for (var emotion in e1) {
    if (!e1.hasOwnProperty(emotion)) {
      continue;
    }
    if (e2.hasOwnProperty(emotion)) {
      e1[emotion] = e1[emotion] * (1.0 - factor) + e2[emotion] * factor;
    }
  }
  for (var emotion in e2) {
    if (e2.hasOwnProperty(emotion) && !e1.hasOwnProperty(emotion)) {
      e1[emotion] = e2[emotion];
    }
  }
  return e1;
}

function setPlayIcon(emotion) {
  var innerHtml = '&#x25B6';
  if (emotion === 'angry') {
    innerHtml = '&#x1F620';
  } else if (emotion === 'sad') {
    innerHtml = '&#x1F622';
  } else if (emotion === 'surprised') {
    innerHtml = '&#x1F633';
  } else if (emotion === 'happy') {
    innerHtml = '&#x1F603';
  } else if (emotion === 'meh') {
    innerHtml = '&#x1F610';
  }
  document.getElementById('startbutton').innerHTML = innerHtml;
}

function setBodyClass(emotion) {
  document.body.className = emotion;
}

function loop(timestamp) {
  animRequest = requestAnimFrame(loop);
  var cp = ctrack.getCurrentParameters();

  var er = ec.meanPredict(cp);
  if (!er) {
    return;
  }

  var nextEmotions = getEmotionMap(er);
  if (start === null) {
    start = timestamp;
    emotions = nextEmotions;
  } else {
    var elapsed = timestamp - last;
    emotions = blendEmotions(emotions, nextEmotions, elapsed);
  }
  maxEmotion = getMaxEmotion(emotions);
  console.log(maxEmotion);
  last = timestamp;
}

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();
