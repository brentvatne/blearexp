import React from 'react';
import { takeSnapshotAsync, ImagePicker, KeepAwake } from 'expo';
import { LinearCopy } from 'gl-react';
import {
  CameraRoll,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  StatusBar,
  View,
  Slider,
} from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import { Surface } from '@brentvatne/gl-react-expo';
import Touchable from 'react-native-platform-touchable';
import {
  ActionSheetProvider,
  connectActionSheet,
} from '@expo/react-native-action-sheet';
import { AppLoading, FileSystem } from 'expo';

import { BlurXY } from './src/Blur';
import { MultiPassBlur } from './src/MultiPassBlur';
import Effects from './src/Effects';
import GLImage from './src/GLImage';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('window');
const DEFAULT_FACTOR = 4.0;
const MAX_FACTOR = 15.0;
const MIN_FACTOR = 1.0;

const DEFAULT_IMAGE_URI = 'https://i.imgur.com/iPKTONG.jpg';
const DEFAULT_IMAGE_NAME = (() => {
  let parts = DEFAULT_IMAGE_URI.split('/');
  return parts[parts.length - 1];
})();
const DEFAULT_IMAGE_FILE_PATH =
  FileSystem.documentDirectory + DEFAULT_IMAGE_NAME;
const DEFAULT_IMAGE_WIDTH = 1024;
const DEFAULT_IMAGE_HEIGHT = 683;

export default class AppContainer extends React.Component {
  state = {
    loaded: false,
    localImageUri: null,
  };

  render() {
    if (!this.state.loaded) {
      return (
        <AppLoading
          startAsync={this._loadAsync}
          onFinish={() => this.setState({ loaded: true })}
          onError={console.error}
        />
      );
    }

    return (
      <ActionSheetProvider>
        <App localImageUri={this.state.localImageUri} />
      </ActionSheetProvider>
    );
  }

  _loadAsync = async () => {
    let localImageUri;
    try {
      let { exists } = FileSystem.getInfoAsync(DEFAULT_IMAGE_FILE_PATH, {});
      if (!exists) {
        let { uri } = await FileSystem.downloadAsync(
          DEFAULT_IMAGE_URI,
          DEFAULT_IMAGE_FILE_PATH
        );
        localImageUri = uri;
      }
    } catch (e) {
      // nope
    } finally {
      this.setState({ localImageUri, loaded: true });
    }
  };
}

class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      factor: DEFAULT_FACTOR,
      image: {
        uri: this.props.localImageUri || DEFAULT_IMAGE_URI,
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
      },
    };
  }

  render() {
    const { factor } = this.state;

    return (
      <View style={styles.container}>
        <View
          collapsable={false}
          ref={view => {
            this._canvas = view;
          }}>
          <Surface style={{ width: ScreenWidth, height: ScreenHeight }}>
            <LinearCopy>
              <Effects
                saturation={Math.max(
                  1.25,
                  this.state.factor / MAX_FACTOR * 2.0
                )}>
                <MultiPassBlur
                  passes={12}
                  factor={factor}
                  width={ScreenWidth}
                  height={ScreenHeight}>
                  <GLImage
                    source={this.state.image}
                    resizeMode="cover"
                    width={ScreenWidth}
                    height={ScreenHeight}
                  />
                </MultiPassBlur>
              </Effects>
            </LinearCopy>
          </Surface>
        </View>

        {__DEV__ && <KeepAwake />}
        <StatusBar hidden />
        <Controls
          onChangeImage={this._updateImage}
          onChangeFactor={this._updateFactor}
          onSaveImage={this._saveImageAsync}
        />
      </View>
    );
  }

  _updateImage = image => {
    this.setState({ image });
  };

  _saveImageAsync = async () => {
    let result = await takeSnapshotAsync(this._canvas, {
      format: 'png',
      result: 'file',
    });

    let saveResult = await CameraRoll.saveToCameraRoll(result, 'photo');
    alert('Saved to your photos!');
  };

  _updateFactor = factor => {
    this.setState({ factor });
  };
}

class Controls extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <View style={styles.controlsContainer}>
        <View style={styles.sliderContainer}>
          <Slider
            step={0.5}
            onValueChange={this.props.onChangeFactor}
            minimumValue={MIN_FACTOR}
            maximumValue={MAX_FACTOR}
            value={DEFAULT_FACTOR}
            minimumTrackTintColor={
              Platform.OS === 'android' ? '#fafafa' : 'rgba(230,230,230,0.8)'
            }
            maximumTrackTintColor="rgba(220,220,220,0.8)"
            thumbTintColor="rgba(230,230,230,0.8)"
            style={styles.slider}
          />
        </View>

        <View style={styles.leftButtonControlContainer}>
          <CameraButton onSelectImage={this.props.onChangeImage} />
        </View>

        <View style={styles.rightButtonControlContainer}>
          <SaveButton onPress={this.props.onSaveImage} />
        </View>
      </View>
    );
  }
}

@connectActionSheet
class CameraButton extends React.Component {
  render() {
    return (
      <Touchable
        hitSlop={{ top: 25, bottom: 25, left: 20, right: 10 }}
        background={Touchable.Ripple('#ffffff', true)}
        onPress={this._handlePress}>
        <EvilIcons name="camera" style={styles.icon} size={45} />
      </Touchable>
    );
  }

  _handlePress = () => {
    let options = ['Choose from library', 'Cancel'];
    let cancelButtonIndex = 1;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this._openPickerAsync();
        }
      }
    );
  };

  _openPickerAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
    });

    if (!result.cancelled) {
      this.props.onSelectImage({
        uri: result.uri,
        width: result.width,
        height: result.height,
      });
    }
  };
}

class SaveButton extends React.Component {
  render() {
    return (
      <Touchable
        hitSlop={{ top: 25, bottom: 25, left: 10, right: 20 }}
        background={Touchable.Ripple('#eeeeee', true)}
        onPress={this._handlePress}>
        <View>
          <EvilIcons name="check" style={styles.icon} size={45} />
        </View>
      </Touchable>
    );
  }

  _handlePress = () => {
    this.props.onPress();
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 70,
    right: 70,
    height: 40,
  },
  leftButtonControlContainer: {
    position: 'absolute',
    paddingBottom: 15,
    paddingLeft: 8,
    bottom: 0,
    left: 0,
  },
  slider: {
    ...Platform.select({
      ios: {
        marginTop: -15,
        opacity: 0.8,
      },
    }),
  },
  rightButtonControlContainer: {
    position: 'absolute',
    paddingBottom: 15,
    paddingRight: 8,
    bottom: 0,
    right: 0,
  },
  icon: {
    color: '#fff',
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
});
