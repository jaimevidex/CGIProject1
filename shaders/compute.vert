precision highp float;

attribute vec2 vOldPosition;
attribute float vOldFunction; 

varying vec2 vNewPosition;
varying float vNewFunction; 

const int MAX_FUNCS = 4;
uniform mat3 m[MAX_FUNCS];
uniform float p[MAX_FUNCS];
//uniform int nfuncs;

float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    float randomN = random(vOldPosition);

    int index = 0;
    for (int i = 0; i < MAX_FUNCS; i++) {
        if (randomN <= p[i]) {
            index = i;
            break;
        }
    }

    vNewPosition = (m[index] * vec3(vOldPosition, 1.0)).xy;
    vNewFunction = float(index);
}