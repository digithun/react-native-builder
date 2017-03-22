// Contribution from mikeccuk2005
/*
Rename package for your android project, normally react-init does not do this for you!

Usage:
 1. node rename-package.js AppName com.foo.bar
 AppName = react-native init AppName
 com.foo.bar = your applicationId

*/
var setup_utils = require('./setup-common/setup.util.js');
var {
	insertLineInFile,
	runCli
} = setup_utils;

console.log('**rename android application id**');
'use strict';
const appName = process.argv[2];
const appId = process.argv[3];
(async() => {
	//android
	await insertLineInFile({
		fileUrl: appName + '/android/app/build.gradle',
		content: '        applicationId "' + appId + '"',
		repString: '        applicationId "com.' + appName.toLocaleLowerCase() + '"',
		option: 'replace',
		indent: ''
	});

	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/AndroidManifest.xml',
		content: appId,
		repString: 'com.' + appName.toLocaleLowerCase(),
		option: 'replace',
		indent: ''
	});

	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/com/' + appName.toLocaleLowerCase() + '/MainActivity.java',
		content: appId,
		repString: 'com.' + appName.toLocaleLowerCase(),
		option: 'replace',
		indent: ''
	});

	await insertLineInFile({
		fileUrl: appName + '/android/app/src/main/java/com/' + appName.toLocaleLowerCase() + '/MainApplication.java',
		content: appId,
		repString: 'com.' + appName.toLocaleLowerCase(),
		option: 'replace',
		indent: ''
	});
	await runCli('npm i mkdir-recursive --save');

	let dirSplit = appId.split('.');
	var fx = require('mkdir-recursive');
	fx.mkdirSync(appName + '/android/app/src/main/java/' + dirSplit.join('/'));

	var fs = require('fs');
	fs.renameSync(appName + '/android/app/src/main/java/com/' + appName.toLocaleLowerCase() + '/MainActivity.java',
		appName + '/android/app/src/main/java/' + dirSplit.join('/') + '/MainActivity.java');

	fs.renameSync(appName + '/android/app/src/main/java/com/' + appName.toLocaleLowerCase() + '/MainApplication.java',
		appName + '/android/app/src/main/java/' + dirSplit.join('/') + '/MainApplication.java');

	//IOS
	const files = fs.readdirSync(appName + '/ios/');
	var myProjName = files.filter(function (f) {
		return f.substr(-10) === '.xcodeproj';
	})[0];
	const myProjPath = appName + '/ios/' + myProjName + '/project.pbxproj';
	myProjName = myProjName.replace('.xcodeproj', '');
	console.log('Updating target:' + myProjName + ' at ' + myProjPath + ' ...');

	await insertLineInFile({
		fileUrl: myProjPath,
		content: '\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ' + appId + ';\n\t\t\t\tPRODUCT_NAME = ' + appName + ';',
		repString: '\t\t\t\tPRODUCT_NAME = ' + appName + ';',
		option: 'replaceAll',
		indent: ''
	});

	await insertLineInFile({
		fileUrl: appName + '/ios/' + appName + '/info.plist',
		content: '$(PRODUCT_BUNDLE_IDENTIFIER)',
		repString: 'org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)',
		option: 'replace',
		indent: ''
	});

})();