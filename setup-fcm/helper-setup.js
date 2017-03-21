// Contribution from mikeccuk2005



console.log('**Setup FCMController**');
'use strict';

const appName = process.argv[2];

(async() => {
	var fs = require('fs');

	fs.mkdirSync(appName + '/js/');
	fs.mkdirSync(appName + '/js/fcm');
	fs.writeFileSync(appName + '/js/fcm/FCMController.js', fs.readFileSync('setup-fcm/setup-resource/FCMController.js'));

})();