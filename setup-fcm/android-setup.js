// Contribution from mikeccuk2005
/*
A node script to help set up fcm for use with https://github.com/evollu/react-native-fcm
I am not responsible for damages that the script may do harm to your project.
Use at your own risk

Usage:
 1. Copy this script to your react-native project
 2. Copy the 'google-services.json' to '/setup-resource'
 3. do cli 'node setup-fcm-android.js AppName'.

*/
var setup_utils = require('../setup-common/setup.util.js');
var {
	addAndroidManifestObject,
	insertClassToGradle,
	insertLineEndOfFile,
	copyFile,
	runCli
} = setup_utils;

console.log('**Setup react-native-fcm for android**');
'use strict';
const appName = process.argv[2];

(async() => {
	await runCli('npm i xml2js --save');

	await copyFile('setup-fcm/setup-resource/google-services.json', appName + '/android/app/google-services.json');
	//add google-service dependencies
	await insertClassToGradle({
		fileUrl: '' + appName + '/android/build.gradle',
		classCmd: 'classpath',
		checkClass: 'com.google.gms:google-services',
		versionClass: ':3.0.0',
		repString: 'dependencies {',
		indent: '        '
	});

	//add firebase to '+appName+'
	await insertClassToGradle({
		fileUrl: appName + '/android/app/build.gradle',
		classCmd: 'compile',
		checkClass: 'com.google.firebase:firebase-core',
		versionClass: ':10.+',
		repString: 'dependencies {',
		indent: '    '
	});

	//insert apply plugin google-services
	await insertLineEndOfFile({
		fileUrl: appName + '/android/app/build.gradle',
		addString: 'apply plugin: \'com.google.gms.google-services\''
	});

	//add uses-permission to the '+appName+'
	await addAndroidManifestObject({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'uses-permission'],
		line: [
			'<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
			'<uses-permission android:name="android.permission.VIBRATE" />'
		]
	});

	//add service to application
	await addAndroidManifestObject({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'service'],
		line: [
			'<service android:name="com.evollu.react.fcm.MessagingService" android:enabled="true" android:exported="true"><intent-filter><action android:name="com.google.firebase.MESSAGING_EVENT"/></intent-filter></service>',
			'<service android:name="com.evollu.react.fcm.InstanceIdService" android:exported="false"><intent-filter><action android:name="com.google.firebase.INSTANCE_ID_EVENT"/></intent-filter></service>'
		]
	});

	//add singletop property
	await addAndroidManifestObject({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'activity', 0, '$'],
		line: ['android:launchMode="singleTop"']
	});

	//add intent to the manifest
	await addAndroidManifestObject({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'activity', 0, 'intent-filter'],
		line: ['<intent-filter><action android:name="fcm.ACTION.DEFAULT" /><category android:name="android.intent.category.DEFAULT" /></intent-filter>']
	});

})();