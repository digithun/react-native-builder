// Copyright 2004-present Facebook. All Rights Reserved.
/*
 A node script to help set up FBSDK frameworks for use with https://github.com/facebook/react-native-fbsdk
 after you have already run `rnpm install react-native-fbsdk`.

 Note that you need to create a Facebook App in https://developers.facebook.com/
 and get the Facebook APP ID and Facebook APP Name in order to set up the Info.plist.

 Usage:
 1. do 'node ios_setup.js <AppID> <AppName>'.
 */
'use strict';

var setup_utils = require('../setup-common/setup.util.js');
var {
  insertLineInFile,
  runCli
} = setup_utils;

(async() => {
  await runCli('npm i plist --save');

  const fs = require('fs');
  const path = require('path');
  const plist = require('plist');
  const spawn = require('child_process').spawn;

  const appId = process.argv[2];
  const appName = process.argv[3];

  const frameworkUrl = 'https://origincache.facebook.com/developers/resources/?id=facebook-ios-sdk-current.zip';

  //POD add FB 'FBSDKCoreKit', 'FBSDKLoginKit', 'FBSDKShareKit'
  await insertLineInFile({
    fileUrl: appName + '/ios/Podfile',
    content: '  pod \'FBSDKCoreKit\'\n  pod \'FBSDKLoginKit\'\n  pod \'FBSDKShareKit\'',
    repString: '  # Pods for Clogii',
    option: 'after',
    indent: ''
  });

  await runCli('echo Install pod...');
  await runCli('cd ' + appName + '/ios && pod install');

  const plistFilePath = appName + '/ios/' + appName + '/Info.plist'; //plistDirPath + '/Info.plist';
  const plistFile = fs.readFileSync(plistFilePath, 'utf8');
  const plistObject = plist.parse(plistFile);
  plistObject.CFBundleURLTypes = [{
    CFBundleURLSchemes: ['fb' + appId]
  }];
  plistObject.FacebookAppID = appId;
  plistObject.FacebookDisplayName = appName;
  plistObject.LSApplicationQueriesSchemes = ['fbapi', 'fb-messenger-api', 'fbauth2', 'fbshareextension'];
  plistObject.NSLocationWhenInUseUsageDescription = '';
  fs.writeFileSync(plistFilePath, plist.build(plistObject));
  console.log('Finished updating ' + plistFilePath);

})();