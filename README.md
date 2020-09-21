# Eye-Blink-Detection
Javascript project to detect eye blink from video feed.

# Current approch
1. Create a window on the video feed(much smaller than the actual frame size).
2. Look for face and eye on the window.

Result comparison:


* Face is detected but eye is not -> eyes closed
* Face and eye both are detected -> eyes open
