var setup_utils = require('./setup-common/setup.util.js');
var {
    runCli
} = setup_utils;

let appName = 'Clogii';
let packageAndBundle = 'com.clogii.clog';
let FBId = '1234567890';

(async() => {
    //initial setup
    // await runCli('react-native init ' + appName);
    // await runCli('node rename-package.js ' + appName + ' ' + packageAndBundle);

    // //setup fcm
    await runCli('node setup-fcm/android-setup.js ' + appName);
    await runCli('node setup-fcm/ios-setup.js ' + appName);
    await runCli('node setup-fcm/helper-setup.js ' + appName); //optional

    //setup fbsdk
    
})();