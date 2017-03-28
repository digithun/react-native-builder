# clogii-react-native
## Introduction

>This repo intention is to make setup react-naive with external modules much more easier. With our Automated script, it will edit AndroidManifest, Gradle, Java, .h, .m on initial setup to work perfectly with the module.
>
>How can this be useful?
Certainly when you have multiple project and want to avoid manual work of setting up these modules. With a single shell command you will get your new project up and running with pre-installed module.


## Project includes automated script for:
  - react-native-fbsdk
  - react-native-fcm
  
## Installation

- Copy your `google-services.json` and `GoogleService-Info.plist` to `/setup-fcm/setup-resource/`

- Configure `.env` file to suit your needs.
- IF you only need FCM then set `FB_ID=false` `INSTALL_NAP=false`

Example `.env`

```env
APP_NAME=MyFirstApp             //Your App name
APP_PACKAGE=com.foo.bar     //Your App Package and bundle identifier
FB_ID=1234567891234567      //Your Facebook App ID, also a flag to install FBSDK, set to false to disable
INSTALL_FCM=true            //Flag to install FCM
INSTALL_NAP=true            //Flag to install NAP, when true, make sure you have FB_ID 
```

### Shell/cmd
```shell
$ node setup
```

### IOS Proeject setup

Please open your XCODE project and do the following:

Open your Xcode, Select your project `Capabilities` > `Background Modes` > `Remote notifications`. Also check `Push Notification`

Also Set your `team` in Xcode

## Build Platforms

- cd to your AppName (AppName is configured in setup.js)
- $ react-native run-android
- $ react-native run-ios


## TODO
- [x] Setup Automation with fcm Android
- [x] Setup Automation with fcm IOS (Partially)
- [x] Setup Automation with fbsdk Android
- [x] Setup Automation with fbsdk IOS (Partially)
- [x] Evn file for change setting instead of embeded in .js
- [ ] Automate set Capabilities for XCODE Project 
- [ ] Automate set Team for XCODE Project 
