import React from "react"
import { Animated, Dimensions, StyleSheet, View } from "react-native"
import { AppLoading, SplashScreen } from "expo"
import { Asset } from "expo-asset"
import Constants from "expo-constants"

export default class AppWithAnimatedSplashScreen extends React.Component {
  state = {
    error: false,
    isAppReady: false,
    isSplashReady: false,
    isSplashAnimationComplete: false,
  }

  splashVisibility = new Animated.Value(1)

  _loadAsync = async () => {
    SplashScreen.hide()
    try {
      await this.props.loadAsync()
    } catch (e) {
      this.props.onError && this.props.onError(e)
      // Continue on and try it anyways
      // this.setState({ isAppReady: true, isSplashAnimationComplete: true })
    } finally {
      this.setState({ isAppReady: true }, () => {
        setTimeout(() => {
          Animated.timing(this.splashVisibility, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            this.setState({ isSplashAnimationComplete: true })
          })
        }, this.props.animationDelayMs || 50)
      })
    }
  }

  _cacheSplashResourcesAsync = async () => {
    await Asset.fromModule(this.props.splashImageSource).downloadAsync()
  }

  render() {
    if (!this.state.isSplashReady) {
      return (
        <AppLoading
          startAsync={this._cacheSplashResourcesAsync}
          autoHideSplash={false}
          onError={console.error}
          onFinish={() => {
            this.setState({ isSplashReady: true })
          }}
        />
      )
    }

    return (
      <View style={{ flex: 1 }}>
        {this.state.isAppReady ? this.props.children : null}
        {this.state.isSplashAnimationComplete ? null : (
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: Constants.manifest.splash.backgroundColor,
              opacity: this.splashVisibility,
            }}
          >
            <Animated.Image
              fadeDuration={0}
              style={{
                width: Dimensions.get("window").width,
                flex: 1,
                resizeMode: "cover",
              }}
              source={this.props.splashImageSource}
              onLoad={this._loadAsync}
            />
          </Animated.View>
        )}
      </View>
    )
  }
}
