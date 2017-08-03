import React from 'react';
import { ImagePicker, KeepAwake } from 'expo';
import { LinearCopy } from 'gl-react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
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

import { BlurXY } from './Blur';
import { MultiPassBlur } from './MultiPassBlur';
import Effects from './Effects';
import GLImage from './GLImage';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('window');
const DEFAULT_FACTOR = 4.0;
const MAX_FACTOR = 15.0;
const MIN_FACTOR = 1.0;

export default class AppContainer extends React.Component {
  render() {
    return (
      <ActionSheetProvider>
        <App />
      </ActionSheetProvider>
    );
  }
}

class App extends React.Component {
  state = {
    factor: DEFAULT_FACTOR,
    image: {
      uri: 'https://i.imgur.com/iPKTONG.jpg',
      width: 1024,
      height: 683,
    },
  };

  render() {
    const { factor } = this.state;

    return (
      <View style={styles.container}>
        <Surface style={{ width: ScreenWidth, height: ScreenHeight }}>
          <LinearCopy>
            <Effects
              saturation={Math.max(1.25, this.state.factor / MAX_FACTOR * 2.0)}>
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

        {__DEV__ && <KeepAwake />}
        <Controls
          onChangeImage={this._updateImage}
          onChangeFactor={this._updateFactor}
        />
      </View>
    );
  }

  _updateImage = image => {
    this.setState({ image });
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
            step={0.25}
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
          <SaveButton />
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
        hitSlop={{ top: 25, bottom: 25, left: 20, right: 10 }}
        background={Touchable.Ripple('#eeeeee', true)}
        onPress={this._handlePress}>
        <View>
          <EvilIcons name="check" style={styles.icon} size={45} />
        </View>
      </Touchable>
    );
  }

  _handlePress = () => {
    alert('Does not do anything yet ;O')
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
    paddingLeft: 12,
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
    paddingRight: 15,
    bottom: 0,
    right: 0,
  },
  icon: {
    color: '#fff',
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
});
