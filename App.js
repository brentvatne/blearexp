import React from 'react';
import { LinearCopy } from 'gl-react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  Slider,
} from 'react-native';
import { Surface } from 'gl-react-expo';
import { BlurXY } from './Blur';
import { MultiPassBlur } from './MultiPassBlur';
import GLImage from './GLImage';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('window');
const exampleImage = {
  uri: 'https://i.imgur.com/iPKTONG.jpg',
  width: 1024,
  height: 683,
};

const DEFAULT_FACTOR = 4.0
const MAX_FACTOR = 10.0;
const MIN_FACTOR = 1.0;

export default class App extends React.Component {
  state = {
    factor: DEFAULT_FACTOR,
  };

  render() {
    return (
      <View style={styles.container}>
        {this._renderImage()}
        {this._renderControls()}
      </View>
    );
  }

  _renderImage() {
    const { factor } = this.state;

    return (
      <Surface style={{ width: ScreenWidth, height: ScreenHeight }}>
        <LinearCopy>
          <MultiPassBlur
            passes={12}
            factor={factor}
            width={ScreenWidth}
            height={ScreenHeight}>
            <GLImage
              source={exampleImage}
              resizeMode="cover"
              width={ScreenWidth}
              height={ScreenHeight}
            />
          </MultiPassBlur>
        </LinearCopy>
      </Surface>
    );
  }

  _renderControls() {
    return (
      <View style={styles.controlsContainer}>
        <View style={styles.sliderContainer}>
          <Slider
            step={0.5}
            onValueChange={this._changeBlurFactor}
            minimumValue={MIN_FACTOR}
            maximumValue={MAX_FACTOR}
            value={DEFAULT_FACTOR}
            minimumTrackTintColor={
              Platform.OS === 'android' ? '#fafafa' : 'rgba(230,230,230,0.8)'
            }
            maximumTrackTintColor="rgba(220,220,220,0.8)"
            thumbTintColor="rgba(230,230,230,0.8)"
          />
        </View>
      </View>
    );
  }

  _changeBlurFactor = factor => {
    this.setState({ factor });
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
    left: 50,
    right: 50,
    height: 50,
  },
});
