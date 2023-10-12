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

const MAX_POINTS = 5000000;
const NUMBER_INTERACTIONS = 50;
let totalIterations = NUMBER_INTERACTIONS;
let currentIteration = 0;
let currentFractal = 0;
let flag = false;

// Movement variables
let harmonizer = 0.001;
let zoomLevel = 1;
let x_delta = 0;
let y_delta = 0;
let mousedownX, mousedownY, mouseupX, mouseupY = 1;

window.addEventListener("keypress", switchCase);

window.addEventListener("wheel", handleZoom);

window.addEventListener("mousedown", handleMouseDown);

window.addEventListener("mouseup", handleDelta);

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

function handleZoom(event) {
    const delta = Math.sign(event.deltaY);
    zoomLevel += event.deltaY * 0.001; // You can adjust the zoom speed as needed
    zoomLevel = Math.max(0.1, Math.min(10.0, zoomLevel)); // Limit the zoom range
}

function handleMouseDown(event) {
    mousedownX = event.x;
    mousedownY = event.y;
}

function handleDelta(event) {
    mouseupX = event.x;
    mouseupY = event.y;
    x_delta = (mouseupX - mousedownX) * -harmonizer;
    y_delta = (mouseupY - mousedownY) * harmonizer;
}

function switchCase(event) {
    let pressedKey = event.key;
    if (isFinite(pressedKey)){
        zoomLevel = 1;
        x_delta = 1;
        y_delta = 1;
        currentFractal = pressedKey-1;
    }
    switch(pressedKey) {
        case "+":
            totalIterations += 1;
        break;
        case "-":
            if (totalIterations > 0)
                totalIterations -= 1;
        break;
        case "i":
            arraymatrix = ifsMatrixes[currentFractal];
            prob = ifsProbs[currentFractal];
            currentIteration = 0;
            if (flag){
                totalIterations = NUMBER_INTERACTIONS;
                flag = false;
            }
            else {
                totalIterations = 0;
                flag = true;
            }
            break;
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
        case "c":
            console.log(currentIteration, totalIterations);
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

    // Zoom
    const zoomUniformLocation = gl.getUniformLocation(drawProgram, "u_zoom");
    gl.uniform1f(zoomUniformLocation, zoomLevel);
4
    // Deslocamento
    const deltaXUniformLocation = gl.getUniformLocation(drawProgram, "x_delta");
    gl.uniform1f(deltaXUniformLocation, x_delta);
    const deltaYUniformLocation = gl.getUniformLocation(drawProgram, "y_delta");
    gl.uniform1f(deltaYUniformLocation, y_delta);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const vPosition = gl.getAttribLocation(drawProgram, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.POINTS, 0, MAX_POINTS);

    // Compute code
    if(currentIteration >= totalIterations) return;
    
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