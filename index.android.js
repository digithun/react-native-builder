/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Button,
  Alert,
  View
} from 'react-native';

import { FCMController, FCMEVENT } from 'js/notification/FCMController';

const sub = 'testTopicAndroid'

const subTest = () => {
  Alert.alert('Subscribe:',sub);
  //Mixpanel.trackWithProperties('Event', { name:"Sub_testTopicAndroid" });

  FCMController.instance().sub(sub);
};

const unsubTest = () => {
  Alert.alert('Unsubscribe:',sub);
  //Mixpanel.trackWithProperties('Event', { name:"UnSub_testTopicAndroid" });

  FCMController.instance().unSub(sub);
};

const publish = () => {
  Alert.alert('send: to subers');
  FCMController.instance().pub(sub, "hello everyone");
};

export default class Clogii extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native FCM ANDROID!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
        <Button
          onPress={subTest}
          title="Subscribe"
          color="#55ff84"
        />
        <Button
          onPress={unsubTest}
          title="Unsubscribe"
          color="#ff1584"
        />
        <Button
          onPress={publish}
          title="publish"
          color="#ff1584"
        />
      </View>
    );
  }

  //GCM Notification
  componentDidMount() {
    FCMController.instance().componentDidMount().addListener(FCMEVENT.ONTOKEN, function tokenCallback(token) {
      console.log('CB token = ', token);
      FCMController.instance().removeListener(FCMEVENT.ONTOKEN, tokenCallback);

      //Mixpanel.initPushHandling('1027742275569');//1027742275569
    });
  }

  componentWillUnmount() {
    FCMController.instance().componentWillUnmount();
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('Clogii', () => Clogii);
