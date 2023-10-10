attribute vec2 vPosition;

uniform vec2 uBottomLeft;
uniform vec2 uTopRight;

void main() 
{
    float width = uTopRight.x - uBottomLeft.x;
    float height = uTopRight.y - uBottomLeft.y;

    gl_PointSize = 1.3;
    gl_Position = vec4((vPosition - uBottomLeft) * vec2(2.0/width, 2.0/height) - vec2(1.0, 1.0), 0.0, 1.0);
}