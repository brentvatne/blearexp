WIP attempt to re-write https://github.com/sindresorhus/blear using
React Native / Expo / gl-react.

# To get it to work fast

Open `node_modules/expo/src/GLView.js` and add the following after
`wrapMethods(gl)`:


```
const oldGetProgramParameter = gl.getProgramParameter;
gl.getProgramParameter = (program, pname) => {
  if (!program.programParameterCache) {
    program.programParameterCache = {};
  }
  if (program.programParameterCache[pname] === undefined) {
    const v = oldGetProgramParameter.call(gl, program, pname);
    program.programParameterCache[pname] = v;
    return v;
  }
  return program.programParameterCache[pname];
};
```
