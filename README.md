# JoyNews

Feel good about the news, even when it's terrible.

Welcome to our GitHub repo!  If you're curious how JoyNews works (and, yes, it *does* work), you're in the right place.  What follows is a bit of a technical / process writeup on this project, in (hopefully) enough detail that you could do something similar.  (Not that you would, you deviant pervert.)

Built for [Comedy Hack Day Toronto](http://www.comedyhackday.org/toronto/) 2017, JoyNews is a combination of:

- a dildo-shaped phone case attachment, complete with CAD designs;
- a web page that uses [clmtrackr](https://github.com/auduno/clmtrackr) together with the [HTML5 vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) to vary phone vibration patterns according to detected facial emotion;
- a mockup of a news app that uses [Material Design Lite](https://getmdl.io/) to achieve Material Design guidelines within said web page.

## Test it Out

Go to [dildo.savageinter.net](https://dildo.savageinter.net) *in Chrome on Android*.

To run this yourself, you need an HTTPS server that you control and that is accessible from your phone.  This means you'll need SSL certificates, either self-signed or through a certificate authority such as [Let's Encrypt](https://letsencrypt.org/).  You can quickly run an HTTPS server accessible over LAN using [Python 2.x](https://www.piware.de/2011/01/creating-an-https-server-in-python/) or [Python 3.x](http://stackoverflow.com/questions/19705785/python-3-https-webserver).

## Process Timeline

6pm Saturday: bounce the idea off a few people at Comedy Hack Day, to make sure that it's funny without being (overly) crude.

9pm Saturday: on the bus home after some beer and general chitchat, Dev happens upon the [HTML5 Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) exists, thereby saving untold hours of work.

7:30pm Saturday: we deliver a stirring 60-second pitch.  The team soon includes a developer, a designer / developer hybrid, a designer, and a comedian, who somehow are all excited to spend their weekend making a giant face-detecting vibrating purple penis out of questionable code and purple Play-Doh.

9:30am Sunday: quick brainstorm.  We grab a whiteboard and start listing out tasks, separating them into the categories "Physical", "Code", and "Presentation".  These map nicely onto our team: we have one dedicated person in each category, plus a fourth (our designer / developer hybrid) who rotates between each as needed.

10am Sunday: design starts on CAD models and logo assets, development starts on probing the limitations of the vibration API.  Design finds [The Authentic Women's Penis Size Preference Chart](https://docs.google.com/presentation/d/1y_IePtHtJ1Z5-Ot3eRjXPJPIXKiYQvByj0ELNXUeFl0/edit#slide=id.g1b907256af_1_8), which purports to contain empirically-determined optimal penis sizes for pleasure, and bases the dimensions off of that.  (Yes, we actually did this.)

10:30am Sunday: it turns out that [pulse width modulation](https://www.arduino.cc/en/Tutorial/PWM), a trick well-known to hardware hackers, works for producing a softer vibration.

11am Sunday: CAD model is done.  Design holds an impromptu meeting: should we 3D print, laser cut, or manually craft the attachment?  3D printing takes too much time, while laser cutting is much faster but can't be done on-site; Design therefore opts for a manual construction process involving foam core board and Play-Doh, and is soon off to the dollar store to procure materials.

12pm Sunday: the dev team takes [the clmtrackr emotion detection demo](https://www.auduno.com/clmtrackr/examples/clm_emotiondetection.html), hides the video, strips the output chart, and wires it up to a page that changes the background color based on the most prominent emotion.

12:15pm Sunday: after a couple more tweaks, Dev and Comedy get together to discuss what vibration patterns most typify the four emotions.  We decide on:

- sad: soft and soothing;
- surprised: short, jumpy bursts;
- angry: full-on vibration;
- happy: you're already happy, so you don't *need* vibration.

1pm Sunday: Design and Dev rework four news articles, one for each emotion, into a news app mockup based around [Material Design Lite](https://getmdl.io/).

1:30pm Sunday: Dev has integrated the emotion-based vibrator into the news app mockup.  Design has a brilliant idea: instead of using background colour to show emotion, why not use emoji?

2pm Sunday: the news app mockup now uses emoji to show emotion.  Meanwhile, Design has fashioned a wonderful dildo attachment, and Comedy has a first draft of a presentation script.  Things are COMING TOGETHER.

3pm Sunday: we've spent an hour in quick Design / Dev / Comedy iterations.  Design suggests last-minute tweaks to the page design, Dev implements them, and both communicate the app's functionality and limitations to Comedy.  Dev also tweaks the emotion detection code a bit: sadness and surprise seem to have lower feature weight, so we bias towards those a bit.

4pm Sunday: Comedy has refined the script into a true gem of genital humour.  Dev and Design pop in to ruin everything by adding presentation slides.

5pm Sunday: practice, practice, practice!  One team member learns to make precisely weird faces to trigger the four emotions from the detector, with mixed success.  The others hammer out their lines.  Minor tweaks to the slides to improve both timing and emoji saturation.

7pm Sunday: tech run-through downstairs.  Mostly smooth, and we still have another hour and a half or so to practice.

11pm Sunday: JoyNews is last up on the stage!  We deliver a blistering performance, the audience goes wild, and then we all collapse exhausted backstage.

## A Quick Note about Face Emotion Selection

The output from `clmtrackr` is an array like this:

``` json
[
  {"emotion": "sad", "value": 0.123},
  {"emotion": "happy", "value": 0.456},
  {"emotion": "surprised", "value": 0.789},
  {"emotion": "angry", "value": 0}
]
```

To determine a single emotion from this, we:

- use an [exponential moving average](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average) to smooth out noise in detected emotions;
- bias the various emotions by a multiplicative factor, based on our observations of relative strength;
- return the emotion with the highest value, or a neutral emotion (in our case, `"meh"`) if that value is under a specified threshold.

This returns a single emotion every animation frame.  We sample the strongest emotion every 1.5 seconds and show that.

## Future Work

Not that we'll actually do this, but our resident academic informs us that every pseudo-scientific endeavour needs this section.  Ideally, it should have serious-sounding subsection titles, like:

### Platform Compatibility

Currently, JoyNews works only in Chrome on Android, and you must allow it to access your camera.  We could, of course, expand this by writing native apps in Android and iOS.

There are native vibration APIs in [Android](https://developer.android.com/reference/android/os/Vibrator.html) and [iOS](http://stackoverflow.com/questions/12966467/are-there-apis-for-custom-vibrations-in-ios), both of which are relatively easy to use.

Android has [FaceDetector](https://developer.android.com/reference/android/media/FaceDetector.html), but it doesn't give nearly as much feature position data as `clmtrackr`.  iOS has [CIDetector](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/CoreImaging/ci_detect_faces/ci_detect_faces.html), which [provides more detailed information](https://developer.apple.com/reference/coreimage/cifacefeature) than `FaceDetector`.

It would also be feasible to use (OpenCV)[http://opencv.org/] via native bridges for each platform.

### Improved Emotion Detection

Face emotion detection works best in good lighting conditions against a neutral or flat color background.  From our testing, you *really* need good control over your eyebrow and mouth muscles to hit all four emotions reliably.  You also need to make sure no other faces are in the frame.

You *can* [train your own models with clmtools](https://github.com/auduno/clmtools).  A more sophisticated implementation could learn the user's facial expressions over time, build a custom model, and use that.

Our algorithm for picking an emotion, described above, could certainly be improved.  Instead of taking the current strongest emotion every 1.5 seconds, we could use the mode of the last several frames.  Alternatively, we could allow the display to show multiple emotions, possibly scaled or ranked to indicate relative performance.

Emotion detection is *definitely* CPU-bound, which makes it a poor match for JavaScript on a mobile device.  Native implementations would be much faster, and could be run on a separate thread to avoid blocking the UI.

### Improved Vibration Feedback

An external motor would be *much* better at vibrating than the phone.  On-phone vibration is also fairly battery-intensive, which is generally undesirable for mobile apps.  We could fix that by communicating with a separate hardware device over Bluetooth.

We should increase the timeout to be slightly longer than `VIBRATION_BLOCK`: we suspect, but have not proven, that `navigator.vibrate()` will not trigger another vibration during an existing one.  It's also possible that these vibration calls are being held up by face detection.

Instead of tying vibration feedback to a single emotion, we could blend between emotions based on their weighted feature values.  This would require a more precise "vibration pattern language" to describe such intermediate states.  Procedural generation techniques, particularly as applied to music, could be helpful here.

### Other Attachments

Finally, while the current attachment is a dildo, nothing in our platform prevents the use of other attachments or separate devices.  Prostate massagers, cock rings, butt plugs, clitoral vibrators, and many other such devices would all be feasible, given enough time and design expertise to model them.  Many existing sex toy lines take advantage of this same modularity, providing attachments to motors that can be swapped out based on desired use.

These attachments could easily be cast out of silicone, which would reduce the risk of the attachment breaking apart and leaving bits of foam and Play-Doh where they really should never be.
