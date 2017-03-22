var setup_utils = require('./setup-common/setup.util.js');
var {
    runCli
} = setup_utils;

let appName = 'Clogii';
let appPackage = 'com.clogii.clog';
let FBId = '1824824607769616';

(async() => {
    //initial setup
    await runCli('react-native init ' + appName);

    var os = require('os');
    if (is.platform().indexOf('win') == 0) {
        //Windows //TODO local.properties
    } else {
        //OSX / linux
        await runCli('echo "ndk.dir=${HOME}/Library/Android/sdk/ndk-bundle\nsdk.dir=${HOME}/Library/Android/sdk" > ' + appName + '/android/local.properties');
    }

    //
    await runCli('node rename-package.js ' + appName + ' ' + appPackage);

    // //setup fcm
    await runCli('node setup-fcm/android-setup.js ' + appName);
    await runCli('node setup-fcm/ios-setup.js ' + appName + ' ' + appPackage);
    //TODO XCODE
    console.log('**Auto Setup complete**\n\n please open your project and do the following:');
    console.log(' Open your Xcdoe, Select your project Capabilities and enable Keychan Sharing and Background Modes > Remote notifications.');

    await runCli('node setup-fcm/helper-setup.js ' + appName); //optional

    //setup fbsdk
    if (FBId && FBId.length > 0) {
        await runCli('node setup-fb/android-setup.js ' + FBId + ' ' + appName + ' ' + appPackage);
        await runCli('node setup-fb/ios-setup.js ' + FBId + ' ' + appName);
    }
})();