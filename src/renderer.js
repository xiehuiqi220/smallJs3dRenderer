import { mat4, vec4 } from "gl-matrix";
import { log, rrgb,getNormal } from "./util";

class Renderer {
  constructor(canvas, options = {}) {
    this.myCanvas = canvas;
    this.showLog = options.showLog;
    this.wireframe = options.wireframe;
    this.mtl = [];
  }

  setMtl(mtl){
    this.mtl = mtl || [];
  }

  getMtlByName(name){
    const mtl = this.mtl.find(m => m.name == name);
    return mtl;
  }

  //裁剪空间坐标转换为画布窗口坐标
  clip2creen(glPos) {
    glPos[0] = (glPos[0] / glPos[3]) * this.myCanvas.width / 2 + this.myCanvas.width / 2;
    glPos[1] = (-glPos[1] / glPos[3]) * this.myCanvas.height / 2 + this.myCanvas.height / 2;
    return glPos;
  }

  render(scene, viewMatrix, projectionMatrix) {
    this.myCanvas.clear();
    this.myCanvas.scene = scene;
    this.myCanvas.wireframe = this.wireframe;

    const models = scene.models || [];
    for (const obj of models) {
      if (obj.hidden) continue;
      const verticesInWindow = [];

      //绘制顶点
      obj.vertices = obj.vertices || [];
      obj.vertices.forEach((vertex) => {
        vertex[3] = 1;//增加xyzw的w，默认为1，转换为齐次坐标
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
        this.showLog && log(glPos);

        //处理相机视图
        //console.log("origin", vertex);
        vec4.transformMat4(glPos, glPos, viewMatrix);

        //console.log("after view:", glPos);
        if (projectionMatrix) {
          vec4.transformMat4(glPos, glPos, projectionMatrix);
        }
        //console.log("after project", glPos);

        //console.log(glPos);
        this.clip2creen(glPos);
        //this.myCanvas.drawVertex(glPos[0], glPos[1], this.vertexSize);
        //this.myCanvas.flush();throw "xx";
        verticesInWindow.push(glPos);
      });

      //绘制直线
      obj.lines = obj.lines || [];
      obj.lines.forEach((line) => {
        const start = line[0];
        const end = line[1];
        this.myCanvas.drawLine(
          verticesInWindow[start][0],
          verticesInWindow[start][1],
          verticesInWindow[end][0],
          verticesInWindow[end][1]
        );
      });

      //绘制面，四边面拆成2个三角形
      obj.faces = obj.faces || [];
      obj.faces.forEach((f) => {
        const vs = f.vertices || [];
        //计算面的法线
        const normal4face = getNormal(obj.vertices[f.vertices[0].__vi],obj.vertices[f.vertices[1].__vi],obj.vertices[f.vertices[2].__vi]);

        vs.map((v) => {
          v.__verticeWindowPosition = verticesInWindow[v.__vi];
          if (!v.__verticeWindowPosition) {
            console.warn("vertex index out of range", v.__vi);
          }
        });

        let color = null;
        const mtlName = f.material;
        let mtlInfo = null;
        if(mtlName && (mtlInfo = this.getMtlByName(mtlName))){
          color = {
            r:mtlInfo.Kd.red * 255,
            g:mtlInfo.Kd.green * 255,
            b:mtlInfo.Kd.blue * 255
          }
          debugger
        }

        //如果是四边型，拆成2个三角形绘制
        if (vs.length == 4) {
          this.myCanvas.drawFace([vs[0], vs[1], vs[2]], normal4face, color,obj.__objIndex);
          this.myCanvas.drawFace([vs[2], vs[3], vs[0]], normal4face, color,obj.__objIndex);
        }
        else if (vs.length == 3) {
          this.myCanvas.drawFace(vs, normal4face, color,obj.__objIndex);
        } else throw `invalid face vertices ${vs.length}`;
      });
    }


    //之前只是设置缓冲区像素点，现在呈现出来
    this.myCanvas.flush();
  }
}

export { Renderer };
