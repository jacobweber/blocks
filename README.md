# Blocks

A falling blocks game, inspired by Tetris. Intended only as a demonstration of ReactJS and Cordova development.

https://jacobweber.com/blocks/

To run the web app:
```
yarn
yarn run start
```

Can be played on iOS or Android by loading the URL above, and adding it to the home screen.

To build native iOS or Android apps, first create a file `cordova/build.json` with the appropriate [iOS](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#using-buildjson) or [Android](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#using-buildjson) settings.

Then run either:
```
yarn run ios
yarn run android
```