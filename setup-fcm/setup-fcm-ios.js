// Contribution from mikeccuk2005
/*
A node script to help set up fcm for use with https://github.com/evollu/react-native-fcm
I am not responsible for damages that the script may do harm to your project.
Use at your own risk

Usage:
 1. Copy this script to your react-native project
 2. Copy the 'GoogleService-Info.plist' to '/setup-resource'
 3. do cli 'node setup-fcm-ios.js'.
 4. Open your Xcdoe, Select your project Capabilities and enable Keychan Sharing and Background Modes > Remote notifications.
 5. Make sure your google plist in the project and is target for your main project.

*/
var setup_utils = require('./setup-resource/setup.util.js');
var {
	copyFile,
	insertLineEndOfFile,
	insertLineInFile,
	runCli
} = setup_utils;

console.log('**Setup react-native-fcm for iOS**');
'use strict';

const appName = process.argv[2];
if (appName === undefined) return console.log('**ERROR** appName not defined , please use \'node setup-fcm-ios myApp\'');

(async() => {
	await runCli('echo \'installing packages..\'');
	await runCli('cd .. && npm i xcode --dev');
	await runCli('cd .. && npm i');
	await runCli('echo \'installing fcm..\'');
	await runCli('cd .. && npm i react-native-fcm --save');
	await runCli('echo Init Pod...');
	await runCli('cd ../ios && pod init');

	//pod remove tvos duplicate (TODO wait for react-native fix)
	console.log('-------------------------------------');
	await insertLineInFile({
		fileUrl: '../ios/Podfile',
		content: '',
		repString: '  target \'' + appName + '-tvOSTests\' do\n    inherit! :search_paths\n    # Pods for testing\n  end',
		option: 'replace',
		indent: ''
	});

	//pod add fcm
	await insertLineInFile({
		fileUrl: '../ios/Podfile',
		content: '  pod \'Firebase/Core\'\n  pod \'Firebase/Messaging\'',
		repString: '  # Pods for Clogii',
		option: 'after',
		indent: ''
	});

	await runCli('echo Install pod...');
	await runCli('cd ../ios && pod install');

	await runCli('echo Linking fcm...');
	await runCli('cd .. && react-native unlink react-native-fcm');
	await runCli('cd .. && react-native link react-native-fcm');

	//add google-service to directory
	copyFile('setup-resource/GoogleService-Info.plist', '../ios/' + appName + '/GoogleService-Info.plist');
	//edit add google-service file to project
	//await addGoogleServiceFileToProj(appName);

	//modify delegate
	await insertLineInFile({
		fileUrl: '../ios/' + appName + '/AppDelegate.h',
		content: '@import UserNotifications;\n@interface AppDelegate : UIResponder <UIApplicationDelegate, UNUserNotificationCenterDelegate>',
		repString: '@interface AppDelegate : UIResponder <UIApplicationDelegate>',
		option: 'direct',
		indent: ''
	});

	//add fcm import
	await insertLineInFile({
		fileUrl: '../ios/' + appName + '/AppDelegate.m',
		content: '#import "RNFIRMessaging.h"\n',
		repString: '@implementation AppDelegate',
		option: 'before',
		indent: ''
	});

	//run fcm service
	await insertLineInFile({
		fileUrl: '../ios/' + appName + '/AppDelegate.m',
		content: '  [FIRApp configure];\n  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];',
		repString: 'didFinishLaunchingWithOptions:(NSDictionary *)launchOptions\n{',
		option: 'after',
		indent: ''
	});

	//add delegate functions
	await insertLineInFile({
		fileUrl: '../ios/' + appName + '/AppDelegate.m',
		content: '- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler\n{\n  [RNFIRMessaging willPresentNotification:notification withCompletionHandler:completionHandler];\n}\n\n- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler\n{\n  [RNFIRMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];\n}\n\n//You can skip this method if you don\'t want to use local notification\n-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {\n  [RNFIRMessaging didReceiveLocalNotification:notification];\n}\n\n- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{\n  [RNFIRMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];\n}',
		repString: '@end',
		option: 'before',
		indent: ''
	});

	console.log('***********************************');
	console.log('**Auto Setup complete**\n please open your project and do the following:');
	console.log(' 1. Open your Xcdoe, Select your project Capabilities and enable Keychan Sharing and Background Modes > Remote notifications.');
	console.log(' 2. Make sure your google plist in the project and is target for your main project');


})();

// function addGoogleServiceFileToProj(appName) {
// 	return new Promise((resolve) => {
// 		var xcode = require('xcode'),
// 			projectPath = '../ios/' + appName + '.xcodeproj/project.pbxproj';
// 		myProj = xcode.project(projectPath);

// 		myProj.parse(function (err) {

// 			if (err) {
// 				console.log('addGoogleServiceFileToProj failed: ', err);
// 				return;
// 			}

// 			var pbxGroupKey = myProj.findPBXGroupKey({
// 				name: appName
// 			});

// 			// work around for no resource in xcode
// 			myProj.addPbxGroup(['/Resources'], 'Resources', '', null);
// 			myProj.addResourceFile(appName + '/GoogleService-Info.plist', {}, pbxGroupKey);
// 			const fs = require('fs');
// 			fs.writeFileSync(projectPath, myProj.writeSync());

// 			console.log('xcode project modified');

// 			resolve(null);
// 		});
// 	});
// }