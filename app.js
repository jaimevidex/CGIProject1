import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "./libs/utils.js";
import { vec2,flatten, sizeof} from "./libs/MV.js";
import { ifsMatrixes, ifsProbs } from "./ifs.js";

/** @type {WebGL2RenderingContext} */
var gl;
/** @type {WebGLProgram} */
var drawProgram, computeProgram;
/** @type {HTMLCanvasElement} */
var canvas;
/** @type {Float32Array} */
var arraymatrix = ifsMatrixes[0];
/** @type {Float32Array} */
var prob = ifsProbs[0];
var aspect;
/** @type {WebGLBuffer} */
var aBuffer, bBuffer;

const MAX_POINTS = 500000;
const NUMBER_INTERACTIONS = 50;
let currentIteration = 0;

window.addEventListener("keypress", switchCase);

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function setup(shaders)
{
    // Setup
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas, {alpha: true});
    
    window.addEventListener("resize", resize);
    resize(canvas);

    drawProgram = buildProgramFromSources(gl, shaders["shader.vert"],shaders["shader.frag"]);
    computeProgram = buildProgramFromSources(gl, shaders["compute.vert"],shaders["compute.frag"], ["vNewPosition"/* ,"vNewFunction" */]);

    const vertices = [];
    for (let i = 0; i < MAX_POINTS; i++) {
        vertices.push(vec2(Math.random(), Math.random() ));
    }

    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STREAM_COPY);


    bBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof["vec2"], gl.STREAM_COPY);
   
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Setup the background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Call animate for the first time
    
    window.requestAnimationFrame(animate);
}

function switchCase(event) {
    let number = event.key;
    switch(number) {
        case '1':
            arraymatrix = ifsMatrixes[0];
            prob = ifsProbs[0];
            currentIteration = 0;
            break;
        case '2':
            arraymatrix = ifsMatrixes[1];
            prob = ifsProbs[1];
            currentIteration = 0;
            break;
        case '3':
            arraymatrix = ifsMatrixes[2];
            prob = ifsProbs[2];
            currentIteration = 0;
            break;
        case '4':
            arraymatrix = ifsMatrixes[3];
            prob = ifsProbs[3];
            currentIteration = 0;
            break;
        case '5':
            arraymatrix = ifsMatrixes[4];
            prob = ifsProbs[4];
            currentIteration = 0;
            break;
        case '6':
            arraymatrix = ifsMatrixes[5];
            prob = ifsProbs[5];
            currentIteration = 0;
            break;
        case '7':
            arraymatrix = ifsMatrixes[6];
            prob = ifsProbs[6];
            currentIteration = 0;
            break;
        case '8':
            arraymatrix = ifsMatrixes[7];
            prob = ifsProbs[7];
            currentIteration = 0;
            break;
        case '9':
            arraymatrix = ifsMatrixes[8];
            prob = ifsProbs[8];
            currentIteration = 0;
            break;
        case '0':
            arraymatrix = ifsMatrixes[9];
            prob = ifsProbs[9];
            currentIteration = 0;
            break;
        default:
            arraymatrix = ifsMatrixes[0];
            prob = ifsProbs[0];
            currentIteration = 0;
            break;
    }
}

function animate() 
{
    window.requestAnimationFrame(animate);

    // Drawing code
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(drawProgram);

    gl.uniform2f(gl.getUniformLocation(drawProgram, "uBottomLeft"), -aspect*4, -1.0);
    gl.uniform2f(gl.getUniformLocation(drawProgram, "uTopRight"), aspect*4, 11.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const vPosition = gl.getAttribLocation(drawProgram, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.POINTS, 0, MAX_POINTS);

    // Compute code
    if(currentIteration >= NUMBER_INTERACTIONS) return;

    gl.useProgram(computeProgram);
    
    for(let i=0; i<arraymatrix.length; i++) {
        const uM = gl.getUniformLocation(computeProgram, "m["+i+"]");
        gl.uniformMatrix3fv(uM, false, arraymatrix[i]) 
    }
    const uF = gl.getUniformLocation(computeProgram, "p");
    gl.uniform1fv(uF, prob);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const vOldPosition = gl.getAttribLocation(computeProgram, "vOldPosition");
    gl.vertexAttribPointer(vOldPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vOldPosition);

    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bBuffer);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, MAX_POINTS);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    
    gl.disable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.deleteTransformFeedback(transformFeedback);

    const temp = aBuffer;
    aBuffer = bBuffer;
    bBuffer = temp;

    currentIteration++;
}

loadShadersFromURLS(["shader.vert", "shader.frag", "compute.vert", "compute.frag"]).then(shaders => setup(shaders));