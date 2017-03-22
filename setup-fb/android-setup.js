// Contribution from mikeccuk2005
/*
A node script to help set up fcm for use with https://github.com/evollu/react-native-fcm
I am not responsible for damages that the script may do harm to your project.
Use at your own risk

Usage:
 1. do 'node ios_setup.js <AppID> <AppName>'.
*/

var setup_utils = require('../setup-common/setup.util.js');
var {
	addAndroidManifestObject,
	insertLineInFile,
	runCli
} = setup_utils;

console.log('**Setup react-native-fcm for android**');
'use strict';

const FBId = process.argv[2]; //fb app id
const appName = process.argv[3]; //app name when init first time
const appPackage = process.argv[4]; //app package name, eg com.foo.bar

(async() => {
	await runCli('npm init -f');
	await runCli('echo \'installing FB SDK..\'');
	await runCli('cd ' + appName + ' && react-native install react-native-fbsdk');
	await runCli('echo \'linking FB SDK to your project..\'');
	await runCli('cd ' + appName + ' && react-native link react-native-fbsdk');
	await runCli('npm i xml2js --save');

	//android setup from https://github.com/facebook/react-native-fbsdk
	//main application
	//import
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainApplication.java',
		content: 'import com.facebook.CallbackManager;\nimport com.facebook.FacebookSdk;',
		repString: 'public class MainApplication extends Application implements ReactApplication {',
		option: 'before',
		indent: ''
	});

	//Callback
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainApplication.java',
		content: '  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();\n\n  protected static CallbackManager getCallbackManager() {\n    return mCallbackManager;\n  }',
		repString: 'public class MainApplication extends Application implements ReactApplication {',
		option: 'after',
		indent: ''
	});

	//MainApplication - onCreate
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainApplication.java',
		content: '    FacebookSdk.sdkInitialize(getApplicationContext());\n',
		repString: '    super.onCreate();',
		option: 'after',
		indent: ''
	});

	//MainApplication - getPackage
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainApplication.java',
		content: 'new FBSDKPackage(mCallbackManager)',
		repString: 'new FBSDKPackage()',
		option: 'replace',
		indent: ''
	});

	//MainActivity - import
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainActivity.java',
		content: 'import android.content.Intent;',
		repString: 'public class MainActivity extends ReactActivity {',
		option: 'before',
		indent: ''
	});

	//MainActivity - override onActivityResult
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/' + appPackage.split('.').join('/') + '/MainActivity.java',
		content: '    @Override\n    public void onActivityResult(int requestCode, int resultCode, Intent data) {\n        super.onActivityResult(requestCode, resultCode, data);\n        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);\n    }',
		repString: 'public class MainActivity extends ReactActivity {',
		option: 'after',
		indent: ''
	});

	//facebook_app_id string
	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/res/values/strings.xml',
		content: '<string name="facebook_app_id">' + FBId + '</string>',
		repString: '<resources>',
		option: 'after',
		indent: '    '
	});

	//addAndroidManifestObject ?? android.permission.INTERNET already have by default
	//

	//add meta-data
	await addAndroidManifestObject({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'meta-data'],
		line: [
			'<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>'
		]
	});

})();