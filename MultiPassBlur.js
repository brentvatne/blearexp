import React, { Component } from 'react';
import { connectSize } from 'gl-react';
import { Blur1D } from './Blur';

// empirical strategy to chose a 2d vector for a blur pass
const NORM = Math.sqrt(2) / 2;
export const directionForPass = (p: number, factor: number, total: number) => {
  const f = factor * 2 * Math.ceil(p / 2) / total;
  switch ((p - 1) % 4) { // alternate horizontal, vertical and 2 diagonals
    case 0:
      return [f, 0];
    case 1:
      return [0, f];
    case 2:
      return [f * NORM, f * NORM];
    default:
      return [f * NORM, -f * NORM];
  }
};

// recursively apply Blur1D to make a multi pass Blur component
export const MultiPassBlur = connectSize(({ children, factor, passes }) => {
  const rec = pass =>
    pass <= 0
      ? children
      : <Blur1D direction={directionForPass(pass, factor, passes)}>
          {rec(pass - 1)}
        </Blur1D>;
  return rec(passes);
});