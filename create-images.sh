#!/bin/bash
# https://realfavicongenerator.net/ for favicon.ico
SVG=src/assets/logo.svg
SPLASH_CENTER=/tmp/splash_center.png
SPLASH_CENTER_LARGE=/tmp/splash_center_large.png

function splash {
	convert "$SPLASH_CENTER_LARGE" \
		-gravity center -background white -extent "$1x$2" \
		"png:$3"
}

function splash_9patch {
	convert "$SPLASH_CENTER" \
		-gravity center -background white -extent "$1x$2" \
		-bordercolor white -border 1x1 \
		-fill black -draw "point 1,0" -draw "point $1,0" \
		-draw "point 0,1" -draw "point 0,$2" \
		"png:$3"
}


rm -f public/logo192.png public/logo512.png
svg2png "$SVG" -w 192 -h 192 -o public/logo192.png
svg2png "$SVG" -w 512 -h 512 -o public/logo512.png

rm -rf cordova/res/icon/ios
mkdir -p cordova/res/icon/ios
#svg2png "$SVG" -w 57 -h 57 -o cordova/res/icon/ios/icon.png
convert public/logo512.png -resize 57x57 cordova/res/icon/ios/icon.png
svg2png "$SVG" -w 114 -h 114 -o cordova/res/icon/ios/icon@2x.png
svg2png "$SVG" -w 60 -h 60 -o cordova/res/icon/ios/icon-60.png
svg2png "$SVG" -w 120 -h 120 -o cordova/res/icon/ios/icon-60@2x.png
svg2png "$SVG" -w 180 -h 180 -o cordova/res/icon/ios/icon-60@3x.png
svg2png "$SVG" -w 72 -h 72 -o cordova/res/icon/ios/icon-72.png
svg2png "$SVG" -w 144 -h 144 -o cordova/res/icon/ios/icon-72@2x.png
svg2png "$SVG" -w 76 -h 76 -o cordova/res/icon/ios/icon-76.png
svg2png "$SVG" -w 152 -h 152 -o cordova/res/icon/ios/icon-76@2x.png
svg2png "$SVG" -w 167 -h 167 -o cordova/res/icon/ios/icon-83.5@2x.png
svg2png "$SVG" -w 167 -h 167 -o cordova/res/icon/ios/icon-167.png
#svg2png "$SVG" -w 29 -h 29 -o cordova/res/icon/ios/icon-small.png
convert public/logo512.png -resize 29x29 cordova/res/icon/ios/icon-small.png
svg2png "$SVG" -w 58 -h 58 -o cordova/res/icon/ios/icon-small@2x.png
svg2png "$SVG" -w 87 -h 87 -o cordova/res/icon/ios/icon-small@3x.png
#svg2png "$SVG" -w 50 -h 50 -o cordova/res/icon/ios/icon-50.png
convert public/logo512.png -resize 50x50 cordova/res/icon/ios/icon-50.png
svg2png "$SVG" -w 100 -h 100 -o cordova/res/icon/ios/icon-50@2x.png
svg2png "$SVG" -w 40 -h 40 -o cordova/res/icon/ios/icon-40.png
svg2png "$SVG" -w 80 -h 80 -o cordova/res/icon/ios/icon-40@2x.png

rm -rf cordova/res/icon/android
mkdir -p cordova/res/icon/android
svg2png "$SVG" -w 36 -h 36 -o cordova/res/icon/android/ldpi.png
svg2png "$SVG" -w 48 -h 48 -o cordova/res/icon/android/mdpi.png
svg2png "$SVG" -w 72 -h 72 -o cordova/res/icon/android/hdpi.png
svg2png "$SVG" -w 96 -h 96 -o cordova/res/icon/android/xhdpi.png
svg2png "$SVG" -w 144 -h 144 -o cordova/res/icon/android/xxhdpi.png
svg2png "$SVG" -w 192 -h 192 -o cordova/res/icon/android/xxxhdpi.png

rm -f "$SPLASH_CENTER" "$SPLASH_CENTER_LARGE"
svg2png "$SVG" -w 250 -h 250 -o "$SPLASH_CENTER"
svg2png "$SVG" -w 500 -h 500 -o "$SPLASH_CENTER_LARGE"

rm -rf cordova/res/screen/ios
mkdir -p cordova/res/screen/ios
splash 2732 2732 cordova/res/screen/ios/Default@2x~universal~anyany.png

rm -rf cordova/res/screen/android
mkdir -p cordova/res/screen/android
splash_9patch 320 426 cordova/res/screen/android/splash-port-ldpi.9.png
splash_9patch 426 320 cordova/res/screen/android/splash-land-ldpi.9.png
splash_9patch 320 470 cordova/res/screen/android/splash-port-mdpi.9.png
splash_9patch 470 320 cordova/res/screen/android/splash-land-mdpi.9.png
splash_9patch 480 640 cordova/res/screen/android/splash-port-hdpi.9.png
splash_9patch 640 480 cordova/res/screen/android/splash-land-hdpi.9.png
splash_9patch 720 960 cordova/res/screen/android/splash-port-xhdpi.9.png
splash_9patch 960 720 cordova/res/screen/android/splash-land-xhdpi.9.png

rm -f "$SPLASH_CENTER" "$SPLASH_CENTER_LARGE"
