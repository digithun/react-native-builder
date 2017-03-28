const setup_utils = require('./setup-common/setup.util.js');
const {
    runCli,
    insertLineInFile,
    copyFile
} = setup_utils;



(async() => {
    //initial setup
    await runCli('npm init -f');
    await runCli('npm install dotenv --save');
    require('dotenv').config();
    let {
        APP_NAME,
        APP_PACKAGE,
        FB_ID,
        INSTALL_FCM,
        INSTALL_NAP
    } = process.env;

    await runCli('react-native init ' + APP_NAME);

    await runCli('npm i mkdir-recursive --save');

    const os = require('os');
    if (os.platform().indexOf('win') == 0) {
        //Windows //TODO local.properties
    } else {
        //OSX / linux
        await runCli('echo "ndk.dir=${HOME}/Library/Android/sdk/ndk-bundle\nsdk.dir=${HOME}/Library/Android/sdk" > ' + APP_NAME + '/android/local.properties');
    }

    //
    await runCli('node rename-package.js ' + APP_NAME + ' ' + APP_PACKAGE);

    //xcode CoCoPod
    await runCli('echo Init Pod...');
    await runCli('cd ' + APP_NAME + '/ios && pod init'); //Optinal you may remove this if you have other script that already does this.

    //pod remove tvos duplicate (TODO wait for react-native fix)
    console.log('-------------------------------------');
    await insertLineInFile({
        fileUrl: APP_NAME + '/ios/Podfile',
        content: '',
        repString: '  target \'' + APP_NAME + '-tvOSTests\' do\n    inherit! :search_paths\n    # Pods for testing\n  end',
        option: 'replace',
        indent: ''
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////setup fbsdk
    if (FB_ID && FB_ID.length > 0) {
        //common
        await runCli('echo \'Installing FB SDK..\'');
        await runCli('cd ' + APP_NAME + ' && react-native install react-native-fbsdk');
        await runCli('echo \'Linking FB SDK to your project..\'');
        await runCli('cd ' + APP_NAME + ' && react-native link react-native-fbsdk');
        //Platform
        await runCli('node setup-fb/android-setup.js ' + FB_ID + ' ' + APP_NAME + ' ' + APP_PACKAGE);
        await runCli('node setup-fb/ios-setup.js ' + FB_ID + ' ' + APP_NAME);
    }

    //////////////////////////setup fcm
    if (INSTALL_FCM) {
        //common
        await runCli('echo \'Installing FCM..\'');
        await runCli('cd ' + APP_NAME + ' && npm i react-native-fcm --save');
        await runCli('echo \'Linking FCM to your project..\'');
        await runCli('cd ' + APP_NAME + ' && react-native link react-native-fcm');
        //Platform
        await runCli('node setup-fcm/android-setup.js ' + APP_NAME);
        await runCli('node setup-fcm/ios-setup.js ' + APP_NAME + ' ' + APP_PACKAGE);
        //TODO XCODE
        console.log('**Auto Setup complete**\n\n please open your project and do the following:');
        console.log(' Open your Xcode, Select your project Capabilities > Background Modes > Remote notifications. Also check push notification');
        console.log(' Also Set your team in Xcode');

        await runCli('node setup-fcm/helper-setup.js ' + APP_NAME); //optional
    }

    /////////////////////////setup NAP (https://github.com/rabbotio/nap-react-native)
    if (FB_ID && FB_ID.length > 0 && INSTALL_NAP) {
        // NAP
        await runCli('git clone git@github.com:rabbotio/nap-react-native.git nap-react-native').catch((err) => {});
        // NAP Src
        await runCli('cp -r nap-react-native/nap/lib ' + APP_NAME);
        await runCli('cp -r nap-react-native/nap/components ' + APP_NAME);
        await runCli('cp nap-react-native/nap/app.js ' + APP_NAME);
        await runCli('cp nap-react-native/nap/app.json ' + APP_NAME);
        await runCli('cp nap-react-native/nap/index.ios.js ' + APP_NAME);

        // modify app name for NAP
        await insertLineInFile({
            fileUrl: APP_NAME + '/index.ios.js',
            content: 'const nap = new NAPApp({\n  name: \'' + APP_NAME + '\',',
            repString: 'const nap = new NAPApp({\n  name: \'nap\',',
            option: 'replace',
            indent: ''
        });

        // Library
        await runCli('cd ' + APP_NAME + ' && npm i apollo-client graphql graphql-tag react-apollo react-native-device-info --save');

        // Link
        // https://github.com/rebeccahughes/react-native-device-info
        await runCli('echo \'Linking react-native-device-info to your project..\'');
        await runCli('cd ' + APP_NAME + ' && react-native link react-native-device-info');

        // Run ios
        //node node_modules / react - native / local - cli / cli.js run - ios
    }

})();