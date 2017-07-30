import React from 'react';
import { NearestCopy, LinearCopy, Uniform } from 'gl-react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Surface } from 'gl-react-expo';
import { BlurXY } from './Blur';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('window');

let exampleImage = { uri: 'https://i.imgur.com/iPKTONG.jpg' };

export default class App extends React.Component {
  state = {
    buffering: false,
  };
  onDraw = () => {
    if (!this.state.buffering) {
      // after a first draw without buffering, enable it back
      this.setState({ buffering: true });
    }
  };
  getMainBuffer = () => {
    const { main } = this.refs;
    return main ? Uniform.backbufferFrom(main.getNodeRef()) : null;
  };
  render() {
    return (
      <Surface style={{ width: ScreenWidth, height: ScreenHeight }}>
        <NearestCopy>
          <LinearCopy backbuffering ref="main" onDraw={this.onDraw}>
            <BlurXY factor={20.0}>
              {this.state.buffering ? exampleImage : this.getMainBuffer}
            </BlurXY>
          </LinearCopy>
        </NearestCopy>
      </Surface>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
