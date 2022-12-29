import { mat4, vec4 } from "gl-matrix";

class Renderer {
  constructor(canvas) {
    this.myCanvas = canvas;
  }

  render(scene, viewMatrix) {
    this.myCanvas.clear();

    for (const obj of scene) {
      if (obj.hidden) continue;
      const clip = [];

      obj.vertices.forEach((vertex) => {
        const glPos = vec4.create();
        vec4.transformMat4(glPos, vertex, viewMatrix);
        //vec4.transformMat4(glPos, glPos, projectionMatrix);

        //console.log(glPos);
        this.myCanvas.drawPoint(glPos[0] * 100 + 400, glPos[1] * 100 + 250);
        clip.push(glPos);
      });

      obj.lines.forEach((line) => {
        const start = line[0];
        const end = line[1];
        this.myCanvas.drawLine(
          clip[start][0] * 100 + 400,
          clip[start][1] * 100 + 250,
          clip[end][0] * 100 + 400,
          clip[end][1] * 100 + 250
        );
      });
    }
  }
}

export { Renderer };
