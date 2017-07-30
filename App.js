import React from 'react';
import Slider from 'react-native-slider';
import { LinearCopy } from 'gl-react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Surface } from 'gl-react-expo';
import { BlurXY } from './Blur';
import GLImage from './GLImage';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('window');
const exampleImage = {
  uri: 'https://i.imgur.com/iPKTONG.jpg',
  width: 1024,
  height: 683,
};

export default class App extends React.Component {
  state = {
    factor: 5.0,
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
          <BlurXY factor={factor} width={ScreenWidth / 2} height={ScreenHeight / 2}>
            <GLImage
              source={exampleImage}
              resizeMode="cover"
              width={ScreenWidth}
              height={ScreenHeight}
            />
          </BlurXY>
        </LinearCopy>
      </Surface>
    );
  }

  _renderControls() {
    return (
      <View style={styles.controlsContainer}>
        <View style={styles.sliderContainer}>
          <Slider
            step={1.0}
            value={this.state.factor}
            onValueChange={this._changeBlurFactor}
            trackStyle={styles.sliderTrack}
            thumbStyle={styles.sliderThumb}
            minimumValue={2.0}
            maximumValue={60.0}
            minimumTrackTintColor="rgba(230,230,230,0.8)"
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
  sliderTrack: {
    height: 3,
    borderRadius: 1,
    backgroundColor: 'rgba(220,220,220,0.6)',
  },
  sliderThumb: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: 'rgba(230,230,230,0.8)',
  },
});
