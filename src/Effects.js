import { Shaders, Node } from 'gl-react';
import React from 'react';

const shaders = Shaders.create({
  Saturate: {
    frag: `precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast;
uniform float saturation;
uniform float brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main () {
  vec4 c = texture2D(t, uv);
  vec3 brt = c.rgb * brightness;
  gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}`,
  },
});

export default class Effects extends React.Component {
  static defaultProps = {
    contrast: 1,
    saturation: 1,
    brightness: 1,
  };

  render() {
    const { children: t, contrast, saturation, brightness } = this.props;

    return (
      <Node
        shader={shaders.Saturate}
        uniforms={{ t, contrast, saturation, brightness }}
      />
    );
  }
}
