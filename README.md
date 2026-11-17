# IFS Fractals on the GPU

An interactive renderer for **Iterated Function Systems** — fractals defined by a handful of affine transformations — computed almost entirely on the graphics card.

**[Live demo](https://jaimevidex.github.io/CGIProject1/)** · *Press `1`–`9` and `0` to switch fractals.*

## How it works

The naive way to draw an IFS is to iterate the transform in JavaScript: pick a random function, apply it, plot the point, repeat a million times. That is slow and ties up the main thread.

This renderer does it on the GPU instead:

1. **500,000 points** are seeded at random and stored in a vertex buffer.
2. A **transform-feedback pass** runs 50 iterations per frame: each vertex samples one of the IFS functions according to its probability, applies the corresponding 3×3 affine matrix, and writes its new position straight back into a buffer.
3. A second program draws the buffer as points.

No CPU loop, no readback — the fractal converges while the frame rate stays flat.

The shaders in `shaders/compute.vert` and `compute.frag` implement the chaos game; `shaders/shader.vert` / `shader.frag` do the drawing.

## Controls

| Key | Fractal |
|---|---|
| `1`–`9`, `0` | Ten different IFS presets |

Resizing the window updates the viewport and aspect ratio automatically.

## Run

ES modules require an HTTP origin:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

| File | Responsibility |
|---|---|
| `app.js` | WebGL2 setup, transform feedback, render loop, key handling |
| `ifs.js` | The ten IFS definitions (matrices + probabilities) |
| `shaders/` | Compute and draw shaders |
| `libs/` | Course-provided WebGL helpers (`MV.js`, `utils.js`, three.js) |

## Context

Built for the *Computação Gráfica e Interfaces* course at Instituto Superior Técnico. The `libs/` folder is the course scaffolding, kept so the project runs as submitted.
