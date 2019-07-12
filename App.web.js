import React from 'react';
import {
  Linking,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('./assets/icon.png')} style={styles.logo} />
          <Text style={styles.title}>Blearexp</Text>
        </View>
        <TouchableOpacity onPress={this._handlePressTestFlight}>
          <View style={styles.appStoreButton}>
            <FontAwesome
              name="apple"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.appStoreText}>Get the TestFlight beta</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this._handlePressPlayStore}>
          <View style={styles.playStoreButton}>
            <FontAwesome
              name="android"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.playStoreText}>Get the Play Store beta</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this._handlePressGithub}>
          <View style={styles.githubButton}>
            <FontAwesome
              name="github"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.githubText}>Source code</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _handlePressPlayStore = () => {
    Linking.openURL('https://play.google.com/apps/testing/xyz.bront.blearexp');
  };

  _handlePressTestFlight = () => {
    Linking.openURL('https://testflight.apple.com/join/aHEuRBKA');
  };

  _handlePressGithub = () => {
    Linking.openURL('https://github.com/brentvatne/blearexp');
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    color: '#fff',
  },
  appStoreButton: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  playStoreButton: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  githubButton: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  appStoreText: {
    color: '#fff',
    fontSize: 18,
  },
  playStoreText: {
    color: '#fff',
    fontSize: 18,
  },
  githubText: {
    color: '#fff',
    fontSize: 18,
  },
});
