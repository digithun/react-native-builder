# clogii-react-native
## Introduction

This repo intention is to make setup react-naive with external modules much more easier. With our Automated script, it will edit AndroidManifest, Gradle, Java, .h, .m on initial setup to work perfectly with the module.

How can this be useful?
Certainly when you have multiple project and want to avoid manual work of setting up these modules. With a single shell command you will get your new project up and running with pre-installed module.

Project includes
  Autosetup script project with:
  - react-native-fbsdk
  - react-native-fcm
  
## Installation
### Configuring setup setup.js with your favourite editor.

```js
let appName = 'Clogii';//you app name
let packageAndBundle = 'com.clogii.clog';//your app package name

```
### Shell/cmd
```shell
$ node setup
```

## Build Platforms

- cd to your AppName (AppName is configured in setup.js)
- $ react-native run-android
- $ react-native run-ios


## TODO
- [x] Setup Automation with fcm Android
- [x] Setup Automation with fcm IOS (Partially)
- [ ] Setup Automation with fbsdk Android
- [x] Setup Automation with fbsdk IOS (Partially)
- [ ] Evn file for change setting instead of embeded in .js
