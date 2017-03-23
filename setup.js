const setup_utils = require('./setup-common/setup.util.js');
const {
    runCli,
    insertLineInFile,
    copyFile
} = setup_utils;

let appName = 'Clogii';
let appPackage = 'com.clogii.clog';
let FBId = '1824824607769616';
let installFCM = true;
let installNAP = true;

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

    ///////////////////////////////////////////////////////////////////////////////////////////////////
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
    if (installFCM) {
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
        console.log(' Also Set your team in Xcode');

        await runCli('node setup-fcm/helper-setup.js ' + appName); //optional
    }

    /////////////////////////setup NAP (https://github.com/rabbotio/nap-react-native)
    if (installNAP) {
        // NAP
        await runCli('git clone git@github.com:rabbotio/nap-react-native.git nap-react-native').catch((err)=>{});
        // NAP Src
        await runCli('cp -r nap-react-native/nap/lib ' + appName);
        await runCli('cp -r nap-react-native/nap/components ' + appName);
        await runCli('cp nap-react-native/nap/app.js ' + appName);
        await runCli('cp nap-react-native/nap/app.json ' + appName);
        await runCli('cp nap-react-native/nap/index.ios.js ' + appName);

        // modify app name for NAP
        await insertLineInFile({
            fileUrl: appName + '/index.ios.js',
            content: 'const nap = new NAPApp({\n  name: \'' + appName + '\',',
            repString: 'const nap = new NAPApp({\n  name: \'nap\',',
            option: 'replace',
            indent: ''
        });

        // Library
        await runCli('cd ' + appName + ' && npm i apollo-client graphql graphql-tag react-apollo react-native-device-info --save');

        // Link
        // https://github.com/rebeccahughes/react-native-device-info
        await runCli('echo \'Linking react-native-device-info to your project..\'');
        await runCli('cd ' + appName + ' && react-native link react-native-device-info');

        // Run ios
        //node node_modules / react - native / local - cli / cli.js run - ios
    }

})();