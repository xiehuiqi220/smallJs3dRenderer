import { mat4, vec4 } from "gl-matrix";

class Renderer {
  constructor(canvas) {
    this.myCanvas = canvas;
  }
  
  ndcToScreen(glPos){
    glPos[0] = glPos[0]/glPos[3] * 100 + 400;
    glPos[1] = -glPos[1]/glPos[3] * 100 + 250;
    return glPos;
  }

  render(scene, viewMatrix,projectionMatrix) {
    this.myCanvas.clear();

    for (const obj of scene) {
      if (obj.hidden) continue;
      const clip = [];
      
      //绘制顶点
      obj.vertices.forEach((vertex) => {
        const glPos = vec4.create();
        vec4.transformMat4(glPos, vertex, viewMatrix);
        
        if(projectionMatrix){
          vec4.transformMat4(glPos, glPos, projectionMatrix);
        }

        //console.log(glPos);
        this.ndcToScreen(glPos);
        this.myCanvas.drawPoint(glPos[0],glPos[1]);
        clip.push(glPos);
      });
      
      //绘制直线
      obj.lines.forEach((line) => {
        const start = line[0];
        const end = line[1];
        this.myCanvas.drawLine(
          clip[start][0],
          clip[start][1],
          clip[end][0],
          clip[end][1]
        );
      });
    }
  }
}

export { Renderer };
