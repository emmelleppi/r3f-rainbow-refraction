#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

void main(void){
  gl_FragColor = vec4(gl_FragCoord.x / resolution.x, sin(time) / 2.0 + 0.5, cos(time) / 2.0 + 0.5, 1.0);
}