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
    await runCli('node rename-package.js ' + appName + ' ' + appPackage);

    // //setup fcm
    await runCli('node setup-fcm/android-setup.js ' + appName);
    await runCli('node setup-fcm/ios-setup.js ' + appName);
    await runCli('node setup-fcm/helper-setup.js ' + appName); //optional

    //setup fbsdk
    if (FBId && FBId.length > 0) {
        await runCli('node setup-fb/android_setup.js ' + FBId + ' ' + appName + ' ' + appPackage);
        await runCli('node setup-fb/ios_setup.js ' + FBId + ' ' + appName);
    }

})();