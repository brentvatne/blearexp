import React from 'react';
import { View } from 'react-native';
import { AppLoading, SplashScreen } from 'expo';

export default class AppWithAnimatedSplashScreen extends React.Component {
  state = {
    isAppReady: false,
  };

  render() {
    if (!this.state.isAppReady) {
      return (
        <AppLoading
          startAsync={this.props.loadAsync}
          onError={console.error}
          autoHideSplash={false}
          onFinish={() => {
            this.setState({ isAppReady: true }, () => {
              setTimeout(() => {
                SplashScreen.hide();
              }, this.props.animationDelayMs || 100);
            });
          }}
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {this.state.isAppReady ? this.props.children : null}
      </View>
    );
  }
}
