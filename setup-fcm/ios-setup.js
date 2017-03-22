// Contribution from mikeccuk2005
/*
A node script to help set up fcm for use with https://github.com/evollu/react-native-fcm
I am not responsible for damages that the script may do harm to your project.
Use at your own risk

Usage:
 1. Copy this script to your react-native project
 2. Copy the 'GoogleService-Info.plist' to '/setup-resource'
 3. do cli 'node setup-fcm-ios.js AppName'.
 4. Open your Xcdoe, Select your project Capabilities and enable Keychan Sharing and Background Modes > Remote notifications.
 5. Make sure your google plist in the project and is target for your main project.

*/
var setup_utils = require('../setup-common/setup.util.js');
var {
	copyFile,
	insertLineEndOfFile,
	insertLineInFile,
	runCli
} = setup_utils;

console.log('**Setup react-native-fcm for iOS**');
'use strict';

const appName = process.argv[2];
const appPackage = process.argv[3]; //app package name, eg com.foo.bar

if (appName === undefined) return console.log('**ERROR** appName not defined , please use \'node setup-fcm-ios myApp\'');

(async() => {
	await runCli('npm init -f');
	await runCli('echo \'installing packages..\'');
	await runCli('npm i xcode  --save');
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

	//pod add fcm
	await insertLineInFile({
		fileUrl: appName + '/ios/Podfile',
		content: '  pod \'Firebase/Core\'\n  pod \'Firebase/Messaging\'',
		repString: '  # Pods for Clogii',
		option: 'after',
		indent: ''
	});

	await runCli('echo Install pod...');
	await runCli('cd ' + appName + '/ios && pod install');

	await runCli('echo Linking fcm...');
	await runCli('cd ' + appName + ' && react-native unlink react-native-fcm');
	await runCli('cd ' + appName + ' && react-native link react-native-fcm');

	//add google-service to directory
	copyFile('setup-fcm/setup-resource/GoogleService-Info.plist', appName + '/ios/' + appName + '/GoogleService-Info.plist');
	//edit add google-service file to project
	await addGoogleServiceFileToProj(appName);

	// modify delegate
	await insertLineInFile({
		fileUrl: appName + '/ios/' + appName + '/AppDelegate.h',
		content: '@import UserNotifications;\n@interface AppDelegate : UIResponder <UIApplicationDelegate, UNUserNotificationCenterDelegate>',
		repString: '@interface AppDelegate : UIResponder <UIApplicationDelegate>',
		option: 'direct',
		indent: ''
	});

	//add fcm import
	await insertLineInFile({
		fileUrl: appName + '/ios/' + appName + '/AppDelegate.m',
		content: '#import "RNFIRMessaging.h"\n',
		repString: '@implementation AppDelegate',
		option: 'before',
		indent: ''
	});

	//run fcm service
	await insertLineInFile({
		fileUrl: appName + '/ios/' + appName + '/AppDelegate.m',
		content: '  [FIRApp configure];\n  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];',
		repString: 'didFinishLaunchingWithOptions:(NSDictionary *)launchOptions\n{',
		option: 'after',
		indent: ''
	});

	//add delegate functions
	await insertLineInFile({
		fileUrl: appName + '/ios/' + appName + '/AppDelegate.m',
		content: '- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler\n{\n  [RNFIRMessaging willPresentNotification:notification withCompletionHandler:completionHandler];\n}\n\n- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler\n{\n  [RNFIRMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];\n}\n\n//You can skip this method if you don\'t want to use local notification\n-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {\n  [RNFIRMessaging didReceiveLocalNotification:notification];\n}\n\n- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{\n  [RNFIRMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];\n}',
		repString: '@end',
		option: 'before',
		indent: ''
	});

	await addGoogleServiceFileToProj(appName);

	console.log('***********************************\n***********************************\n***********************************');
	console.log('**Auto Setup complete**\n\n please open your project and do the following:');
	console.log(' Open your Xcode, Select your project Capabilities > Background Modes > Remote notifications. Also check push notification');

	let keyChain =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
		'<plist version="1.0">\n' +
		'<dict>\n' +
		'	<key>keychain-access-groups</key>\n' +
		'	<array>\n' +
		'		<string>$(AppIdentifierPrefix)' + appPackage + '</string>\n' +
		'	</array>\n' +
		'</dict>\n' +
		'</plist>';

	await runCli('echo "'+keyChain+'" > '+appName+'ios/'+appName+'/'+appName+'.entitlements');

})();

function addGoogleServiceFileToProj(appName) {
	console.log('***********************************\n*********Modify XCODE PROJ*********\n***********************************');

	return new Promise((resolve) => {
		var xcode = require('xcode');
		var fs = require('fs');

		const files = fs.readdirSync(appName + '/ios/');
		var myProjName = files.filter(function (f) {
			return f.substr(-10) === '.xcodeproj';
		})[0];
		const myProjPath = appName + '/ios/' + myProjName + '/project.pbxproj';
		myProjName = myProjName.replace('.xcodeproj', '');
		console.log('Updating target:' + myProjName + ' at ' + myProjPath + ' ...');

		const myProj = xcode.project(myProjPath);

		myProj.parse(function (err) {

			if (err) {
				console.log('addGoogleServiceFileToProj failed: ', err);
				resolve(null);
				return;
			}

			var pbxGroupKey = myProj.findPBXGroupKey({
				name: appName
			});

			myProj.pbxCreateGroup('Resources', appName + '/ios/Resources');
			// work around for no resource in xcode
			//myProj.addPbxGroup(['/Resources'], 'Resources', '', null);
			const target = myProj.getFirstTarget().uuid;
			myProj.addResourceFile(appName + '/GoogleService-Info.plist', {
				'target': target
			}, pbxGroupKey);

			fs.writeFileSync(myProjPath, myProj.writeSync());
			console.log('Finished updating ' + myProjPath);

			console.log('xcode project modified');

			resolve(null);
		});
	});
}