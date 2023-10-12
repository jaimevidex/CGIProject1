attribute vec2 vPosition;

uniform vec2 uBottomLeft;
uniform vec2 uTopRight;

uniform float u_zoom; // Uniform to control zoom
uniform float x_delta; // Uniform to control x displacement
uniform float y_delta; // Uniform to control y displacement

void main() 
{
    float width = uTopRight.x - uBottomLeft.x;
    float height = uTopRight.y - uBottomLeft.y;

    vec2 tmp = (vPosition - uBottomLeft) * vec2(2.0/width, 2.0/height) - vec2(1.0+x_delta, 1.0+y_delta);

    gl_PointSize = 1.3;
    gl_Position = vec4(tmp/u_zoom, 0.0, 1.0);
}