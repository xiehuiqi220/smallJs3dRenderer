import { mat4, vec4 } from "gl-matrix";

class Renderer {
  constructor(canvas) {
    this.myCanvas = canvas;
  }

  ndcToScreen(glPos) {
    glPos[0] = (glPos[0] / glPos[3]) * this.myCanvas.width / 2 + this.myCanvas.width / 2;
    glPos[1] = (-glPos[1] / glPos[3]) * this.myCanvas.height / 2 + this.myCanvas.height / 2;
    return glPos;
  }

  render(scene, viewMatrix, projectionMatrix) {
    this.myCanvas.clear();

    for (const obj of scene) {
      if (obj.hidden) continue;
      const clip = [];

      //绘制顶点
      obj.vertices.forEach((vertex) => {
        vertex[3] = 1;//增加xyzw的w，默认为1
        if (!obj.translate) {
          obj.translate = [0, 0, 0];//一致性处理
        } 
        if (!obj.rotate) {
          obj.rotate = [0, 0, 0];//一致性处理
        }
        const glPos = vec4.create();

        //处理模型视图
        const modelMartix = mat4.create();
        mat4.translate(modelMartix, modelMartix, obj.translate);
        mat4.rotateX(modelMartix, modelMartix, obj.rotate[0]);
        mat4.rotateY(modelMartix, modelMartix, obj.rotate[1]);
        mat4.rotateZ(modelMartix, modelMartix, obj.rotate[2]);
        vec4.transformMat4(glPos, vertex, modelMartix);
        console.log(glPos);

        //处理相机视图
        //console.log("origin", vertex);
        vec4.transformMat4(glPos, glPos, viewMatrix);

        //console.log("after view:", glPos);
        if (projectionMatrix) {
          vec4.transformMat4(glPos, glPos, projectionMatrix);
        }
        //console.log("after project", glPos);

        //console.log(glPos);
        this.ndcToScreen(glPos);
        this.myCanvas.drawPoint(glPos[0], glPos[1]);
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
