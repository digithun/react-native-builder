// Contribution from mikeccuk2005
/*
A node script to help set up fcm for use with https://github.com/evollu/react-native-fcm
I am not responsible for damages that the script may do harm to your project.
Use at your own risk

Usage:
 1. Copy this script to your react-native project
 2. Copy the 'google-services.json' to same dir as the script
 3. do cli 'node setup-fcm-android.js'.

*/

console.log('**Setup react-native-fcm for android**');
'use strict';
const fs = require('fs');
var exec = require('child_process').exec;

var cmds = [
	'echo \'installing packages..\'',
	'npm i',
	'echo \'installing fcm..\'',
	'npm i react-native-fcm --save',
	'echo \'linking fcm to your project..\'',
	'react-native link react-native-fcm',
	'npm i xml2js --dev'
];


(async () => {
	await runChainCli(cmds)

	copyFile('google-services.json', 'android/app/google-services.json');
	//add google-service dependencies
	await insertClassToGradle({
		fileUrl: 'android/build.gradle',
		classCmd: 'classpath',
		checkClass: 'com.google.gms:google-services',
		versionClass: ':3.0.0',
		repString: 'dependencies {',
		indent: '        '
	});

	//add firebase to app
	await insertClassToGradle({
		fileUrl: 'android/app/build.gradle',
		classCmd: 'compile',
		checkClass: 'com.google.firebase:firebase-core',
		versionClass: ':10.+',
		repString: 'dependencies {',
		indent: '    '
	});

	//insert apply plugin google-services
	await insertLineEndOfFile({
		fileUrl: 'android/app/build.gradle',
		addString: 'apply plugin: \'com.google.gms.google-services\''
	});

	//add uses-permission to the app
	await addAndroidManifestObject({
		fileUrl: 'android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'uses-permission'],
		line: [
			'<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
			'<uses-permission android:name="android.permission.VIBRATE" />'
		]
	});

	//add service to application
	await addAndroidManifestObject({
		fileUrl: 'android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'service'],
		line: [
			'<service android:name="com.evollu.react.fcm.MessagingService" android:enabled="true" android:exported="true"><intent-filter><action android:name="com.google.firebase.MESSAGING_EVENT"/></intent-filter></service>',
			'<service android:name="com.evollu.react.fcm.InstanceIdService" android:exported="false"><intent-filter><action android:name="com.google.firebase.INSTANCE_ID_EVENT"/></intent-filter></service>'
		]
	});

	//add singletop property
	await addAndroidManifestObject({
		fileUrl: 'android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'activity', 0, '$'],
		line: ['android:launchMode="singleTop"']
	});

	//add intent to the manifest
	await addAndroidManifestObject({
		fileUrl: 'android/app/src/main/AndroidManifest.xml',
		xmlDir: ['manifest', 'application', 0, 'activity', 0, 'intent-filter'],
		line: ['<intent-filter><action android:name="fcm.ACTION.DEFAULT" /><category android:name="android.intent.category.DEFAULT" /></intent-filter>']
	});

})();

////////////////////////////////base funcs//////////////////////////////
function runChainCli(clis) {
	return new Promise((resolve) => {
		var cmd = exec(clis.join(' && '), function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) console.log('exec error: ' + error);

			console.log('Chain cli complete');

			resolve();
		});
	});
}

function insertClassToGradle(config) {
	return new Promise((resolve) => {

		//variables
		let { fileUrl, classCmd, checkClass, versionClass, repString, indent } = config;
		let insertClass = checkClass + versionClass;

		console.log('checking -> ' + fileUrl);
		fs.readFile(fileUrl, 'utf8', (err, fileString) => {

			if (err) return console.log(err);

			console.log('find previous installation of : ', insertClass);

			if (fileString.indexOf(checkClass) == -1) {

				let insertLine = '\n' + indent + classCmd + ' \'' + insertClass + '\'';
				fileString = fileString.replace(repString, repString + insertLine);
				fs.writeFile(fileUrl, fileString, (err2) => {
					console.log('added ' + classCmd, insertClass);
					resolve();
				});

			} else {
				console.log(classCmd, insertClass, '*warning* line already existed.. skiping');
				resolve();
			}

		});
	})
};

function insertLineEndOfFile(config) {
	return new Promise((resolve) => {

		let { fileUrl, addString } = config;

		console.log('checking -> ' + fileUrl);
		fs.readFile(fileUrl, 'utf8', (err, fileString) => {

			if (err) return console.log(err);

			console.log('find previous installation of : ', addString);
			if (fileString.indexOf(addString) == -1) {

				fileString = fileString.concat("\n" + addString);

				fs.writeFile(fileUrl, fileString, (err2) => {
					console.log('added ' + addString + ' to end of file..');
					resolve();
				});

			} else {
				console.log(addString, '*warning* line already existed.. skiping');
				resolve();
			}
		});
	});
}

function addAndroidManifestObject(config) {
	return new Promise((resolve) => {

		Array.prototype.last = function () {
			return this[this.length - 1];
		};

		let { fileUrl, xmlDir, line } = config;
		let isProp = xmlDir.last() === '$';

		console.log('checking -> ' + fileUrl);

		fs.readFile(fileUrl, 'utf8', (err, fileString) => {

			(async () => {
				if (err) return console.log(err);

				let fileObject = await xmlToObj(fileString);
				let targetPointer = fileObject;

				xmlDir.forEach(function (element) {

					if (!targetPointer.hasOwnProperty(element))
						targetPointer[element] = [];

					targetPointer = targetPointer[element];

				});

				if (!isProp && !Array.isArray(targetPointer))
					targetPointer.forEach(function (objectInFile) {
						//find old and remove it from config
						let propName = objectInFile['$']['android:name'];

						let foundOldMatchedIndex = -1;
						for (var i = 0; i < line.length; i++) {
							if (line[i] == null) continue;

							if (line[i].indexOf(propName) > -1) {
								console.log('*warning* Duplicate @ ', line[i]);//<-TODO find better way to detect duplicate line
								line[i] = null;
							}
						}
					});

				for (var i = 0; i < line.length; i++) {
					if (line[i] == null)
						continue;

					if (isProp) {
						let keyValueSplit = line[i].split('=');
						targetPointer[keyValueSplit[0]] = keyValueSplit[1].replace(/['"]+/g, '');//add without quotes
					} else {
						let lineObject = await xmlToObj(line[i]);
						targetPointer.push((lineObject)[xmlDir.last()])

					}
				}

				var xml2js = require('xml2js');
				var builder = new xml2js.Builder();
				var xml = builder.buildObject(fileObject);
				// console.log('xml', xml);

				fs.writeFile(fileUrl, xml, (err2) => {
					console.log(fileUrl,'modified');
					resolve();
				});
			})();
		});
	});
}

function xmlToObj(xml) {
	return new Promise((resolve) => {
		var xml2js = require('xml2js');
		xml2js.parseString(xml, function (err, result) {
			if (err) resolve(null);
			else resolve(result);
		});
	});
}

function copyFile(from, to) {
	console.log('Copying file', from, '->', to, '..');

	//alert when no file to copy
	if (!fs.existsSync(from)) {
		console.log('file not exist', from);
		console.log('file copy skipped..');
	} else {
		//remove previous destination file
		if (fs.existsSync(to)) {
			fs.unlinkSync(to);
			console.log('*warning* old file will be replaced');
		}

		fs.writeFileSync(to, fs.readFileSync(from));
	}
}