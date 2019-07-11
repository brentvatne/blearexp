import React from 'react';
import {
  Dimensions,
  Platform,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
  View,
  Slider,
} from 'react-native';
import { LinearCopy } from 'gl-react';
import { Surface } from 'gl-react-expo';
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { EvilIcons } from '@expo/vector-icons';
import { getInset } from 'react-native-safe-area-view';
import {
  ActionSheetProvider,
  connectActionSheet,
} from '@expo/react-native-action-sheet';
import { AppLoading } from 'expo';

import { BlurXY } from './src/Blur';
import { MultiPassBlur } from './src/MultiPassBlur';
import Effects from './src/Effects';
import GLImage from './src/GLImage';
import AnimatedSplashScreen from './AnimatedSplashScreen';

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
const ALBUM_NAME = 'Blearexp';

export default class AppContainer extends React.Component {
  state = {
    localImageUri: null,
  };

  render() {
    return (
      <AnimatedSplashScreen
        loadAsync={this._loadAsync}
        splashImageSource={require('./assets/splash.png')}>
        <ActionSheetProvider>
          <App localImageUri={this.state.localImageUri} />
        </ActionSheetProvider>
      </AnimatedSplashScreen>
    );
  }

  _loadAsync = async () => {
    try {
      let { exists } = await FileSystem.getInfoAsync(DEFAULT_IMAGE_FILE_PATH);
      if (!exists) {
        let { uri } = await FileSystem.downloadAsync(
          DEFAULT_IMAGE_URI,
          DEFAULT_IMAGE_FILE_PATH
        );
      }
      this.setState({ localImageUri: DEFAULT_IMAGE_FILE_PATH });
    } catch (e) {
      // nope
    }
  };
}

class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      factor: DEFAULT_FACTOR,
      image: {
        uri: this.props.localImageUri,
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
          {this.state.image.uri ? (
            <Surface style={{ width: ScreenWidth, height: ScreenHeight }}>
              <LinearCopy>
                <Effects
                  saturation={Math.max(
                    1.25,
                    (this.state.factor / MAX_FACTOR) * 2.0
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
          ) : null}
        </View>

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
    if (!await canAccessCameraRollAsync()) {
      alert('This app needs camera roll permissions in order to be able to save the image.')
      return;
    }

    let result = await takeSnapshotAsync(this._canvas, {
      format: 'png',
      result: 'tmpfile',
    });

    let asset = await MediaLibrary.createAssetAsync(result);
    let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset.id, false);
    }

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
      <TouchableOpacity
        hitSlop={{ top: 25, bottom: 25, left: 20, right: 10 }}
        onPress={this._handlePress}>
        <EvilIcons name="camera" style={styles.icon} size={45} />
      </TouchableOpacity>
    );
  }

  _handlePress = async () => {
    if ((await canAccessCameraAsync()) && (await canAccessCameraRollAsync())) {
      this._openImagePicker();
    } else {
      alert(
        'You need to give camera and camera roll permissions to use the app'
      );
    }
  };

  _openImagePicker = () => {
    let options = ['Choose from library', 'Take a Picture', 'Cancel'];
    let cancelButtonIndex = 2;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this._openPickerAsync();
        }
        if (buttonIndex === 1) {
          this._openCamera();
        }
      }
    );
  };

  _onSelectImageAsync = async image => {
    if (Platform.OS === 'ios') {
      this.props.onSelectImage({
        uri: image.uri,
        width: image.width,
        height: image.height,
      });
      return;
    }

    // On Android we need to copy it to cache directory to load in GLView
    try {
      let fromPath = image.uri;
      let uriParts = fromPath.split('/');
      let name = uriParts[uriParts.length - 1];
      let destPath = `${FileSystem.cacheDirectory}/${name}`;
      let result = await FileSystem.copyAsync({
        from: fromPath,
        to: destPath,
      });

      this.props.onSelectImage({
        uri: destPath,
        width: image.width,
        height: image.height,
      });
    } catch (e) {
      alert(`Error :( Some info: ${e.message}`);
    }
  };

  _openPickerAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
    });

    if (!result.cancelled) {
      this._onSelectImageAsync(result);
    }
  };

  _openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!result.cancelled) {
      this._onSelectImageAsync(result);
    }
  };
}

class SaveButton extends React.Component {
  render() {
    return (
      <TouchableOpacity
        hitSlop={{ top: 25, bottom: 25, left: 10, right: 20 }}
        onPress={this._handlePress}>
        <View>
          <EvilIcons name="check" style={styles.icon} size={45} />
        </View>
      </TouchableOpacity>
    );
  }

  _handlePress = () => {
    this.props.onPress();
  };
}

async function canAccessCameraRollAsync() {
  let { status: existingStatus } = await Permissions.getAsync(
    Permissions.CAMERA_ROLL
  );
  if (existingStatus === 'granted') {
    return true;
  }

  let { status: askedStatus } = await Permissions.askAsync(
    Permissions.CAMERA_ROLL
  );
  if (askedStatus === 'granted') {
    return true;
  }

  return false;
}

async function canAccessCameraAsync() {
  let { status: existingStatus } = await Permissions.getAsync(
    Permissions.CAMERA
  );
  if (existingStatus === 'granted') {
    return true;
  }

  let { status: askedStatus } = await Permissions.askAsync(Permissions.CAMERA);
  if (askedStatus === 'granted') {
    return true;
  }

  return false;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: getInset ? getInset('bottom') / 2 : 0,
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
