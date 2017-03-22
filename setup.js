const setup_utils = require('./setup-common/setup.util.js');
const {
    runCli,
    insertLineInFile
} = setup_utils;

let appName = 'Clogii';
let appPackage = 'com.clogii.clog';
let FBId = '1824824607769616';

(async() => {
    //initial setup
    await runCli('npm init -f');
    await runCli('react-native init ' + appName);

    await runCli('npm i mkdir-recursive --save');

    const os = require('os');
    if (os.platform().indexOf('win') == 0) {
        //Windows //TODO local.properties
    } else {
        //OSX / linux
        await runCli('echo "ndk.dir=${HOME}/Library/Android/sdk/ndk-bundle\nsdk.dir=${HOME}/Library/Android/sdk" > ' + appName + '/android/local.properties');
    }

    //
    await runCli('node rename-package.js ' + appName + ' ' + appPackage);

    //xcode CoCoPod
    await runCli('echo Init Pod...');
    await runCli('cd ' + appName + '/ios && pod init'); //Optinal you may remove this if you have other script that already does this.

    //pod remove tvos duplicate (TODO wait for react-native fix)
    console.log('-------------------------------------');
    await insertLineInFile({
        fileUrl: appName + '/ios/Podfile',
        content: '',
        repString: '  target \'' + appName + '-tvOSTests\' do\n    inherit! :search_paths\n    # Pods for testing\n  end',
        option: 'replace',
        indent: ''
    });

    ////////////////////////////setup fbsdk
    if (FBId && FBId.length > 0) {
        //common
        await runCli('echo \'Installing FB SDK..\'');
        await runCli('cd ' + appName + ' && react-native install react-native-fbsdk');
        await runCli('echo \'Linking FB SDK to your project..\'');
        await runCli('cd ' + appName + ' && react-native link react-native-fbsdk');
        //Platform
        await runCli('node setup-fb/android-setup.js ' + FBId + ' ' + appName + ' ' + appPackage);
        await runCli('node setup-fb/ios-setup.js ' + FBId + ' ' + appName);
    }

    //////////////////////////setup fcm
    //common
    await runCli('echo \'Installing FCM..\'');
    await runCli('cd ' + appName + ' && npm i react-native-fcm --save');
    await runCli('echo \'Linking FCM to your project..\'');
    await runCli('cd ' + appName + ' && react-native link react-native-fcm');
    //Platform
    await runCli('node setup-fcm/android-setup.js ' + appName);
    await runCli('node setup-fcm/ios-setup.js ' + appName + ' ' + appPackage);
    //TODO XCODE
    console.log('**Auto Setup complete**\n\n please open your project and do the following:');
    console.log(' Open your Xcode, Select your project Capabilities > Background Modes > Remote notifications. Also check push notification');
    
    await runCli('node setup-fcm/helper-setup.js ' + appName); //optional
})();


