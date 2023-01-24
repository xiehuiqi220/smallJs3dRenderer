import { vec3 } from "gl-matrix";

import { WHITE_RGB } from "./constants";
import { rrgb, aabb, is_point_inside_convex_polygon, barycentric, lerpFaceVertices } from "./util";
import { log } from "./util";

class Canvas {
  constructor(canv, w = 800, h = 600) {
    this.width = canv.width = w;
    this.height = canv.height = h;
    this.ctx = canv.getContext("2d", { willReadFrequently: true });
    this.imageData = null;
    this.wireframe = false;
    this.scene = null;//引用当前绘制的场景数据
    this.zBuffer = new Array(w * h);
    this.clear();
  }

  //绘制xy轴
  drawXYAxis() {
    this.drawLine(0, this.height / 2, this.width, this.height / 2, 128, 0, 0);
    this.drawLine(this.width / 2, 0, this.width / 2, this.height, 0, 128, 0);
  }

  clear() {
    //把画布全所有像素设置为#000
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    this.zBuffer.fill(0);

    //log('clear');
    this.drawXYAxis();
  }

  getZBuffer(x, y) {
    x = Math.floor(x); //取整
    y = Math.floor(y);
    const index = x + y * this.imageData.width;
    return this.zBuffer[index];
  }

  setZBuffer(x, y, v) {
    x = Math.floor(x); //取整
    y = Math.floor(y);
    const index = x + y * this.imageData.width;
    this.zBuffer[index] = v;
  }

  //设置点的颜色，x和y必须确保是整数
  setPixel(x, y, r = 255, g = 255, b = 255) {
    const imageData = this.imageData;
    const index = (x + y * imageData.width) * 4;

    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = 255;
  }

  //绘制一个顶点，用圆圈代替
  drawVertex(x, y, size = 1) {
    this.setPixel(x, y, 128, 0, 0);
  }

  //绘制一条直线
  drawLine(x0, y0, x1, y1, r = 255, g = 255, b = 255) {
    let steep = false;
    if (Math.abs(x0 - x1) < Math.abs(y0 - y1)) {
      [x0, y0] = [y0, x0];//swap
      [x1, y1] = [y1, x1];
      steep = true;
    }
    if (x0 > x1) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }
    let dx = x1 - x0;
    let dy = y1 - y0;
    let derror = Math.abs(dy / dx);
    let error = 0;
    let y = y0;
    for (let x = x0; x <= x1; x++) {
      if (steep) {
        this.setPixel(y, x, r, g, b);
      } else {
        this.setPixel(x, y, r, g, b);
      }
      error += derror;
      if (error > .5) {
        y += (y1 > y0 ? 1 : -1);
        error -= 1.;
      }
    }
  }

  uv(val) {
    if (val > 1) val = val - Math.floor(val);//获取小数部分
    if (val < -1) val = val - Math.ceil(val);//获取小数部分

    if (val < 0) val = 1 - val;

    return val;
  }

  //纹理采样
  texture2d(u, v, imageName) {
    if (!imageName) {
      throw "invalid texture file: " + imageName;
    }
    const color = { r: 255, g: 255, b: 255 };

    u = this.uv(u);
    v = this.uv(v);

    const mtl = this.mtl;
    const imageData = mtl.__imageData[imageName];

    if (!imageData) {//说明数据还没下载准备好
      return color;;
    }

    const width = imageData.width;
    const height = imageData.height;

    u = width * u;//u是0到1之间的小数
    v = height * (1 - v);//v是0到1之间的小数，注意uv的坐标是在图片左下角，而不是和canvas一样是在左上角，因此纵坐标要取反

    u = Math.floor(u);//算完之后取整
    v = Math.floor(v);

    const index = (u + v * imageData.width) * 4;

    color.r = imageData.data[index + 0];
    color.g = imageData.data[index + 1];
    color.b = imageData.data[index + 2];

    return color;
  }

  //绘制面
  drawFace(points = [], fnormal = false, fcolor = WHITE_RGB, objIndex, mtlInfo) {
    if (this.wireframe) {
      this._drawWireframe(points);
      return;
    }
    const bbox = aabb(points);

    //遍历bbox围绕的矩形，判断每一个点是不是在多边形里面
    for (var x = bbox.x0; x < bbox.x1; x++) {
      for (var y = bbox.y0; y < bbox.y1; y++) {
        let isInsider = false;//is_point_inside_convex_polygon({ x, y }, points);
        const weights = barycentric([x, y], points);
        isInsider = weights.every(i => i >= 0);//若每个参数都大于等于0，说明在三角形内

        if (!isInsider) {//若点不在三角形内，则忽略
          //this.setPixel(x, y, 255, 255, 255);
          continue;
        }

        let pixelColor = fcolor;//默认顶点颜色由参数指定
        const vertexAttr = lerpFaceVertices(weights, points, this.scene, objIndex);

        //若未指定顶点的颜色，则混合插值，使用顶点颜色平均值
        if (!pixelColor) {
          pixelColor = vertexAttr.color || WHITE_RGB;
        }

        let densityWeight = 1;//光照强度加权，面法线和光线越垂直，则越强

        let normal = vertexAttr.normal;//{x: 0.886292859837691, y: 0.2641827426526553, z: 0.3002285103627892} 单位向量
        const uvw = vertexAttr.uvw;

        if (uvw && mtlInfo && mtlInfo.map_Kd && mtlInfo.map_Kd.file) {//若存在uv设定，且有贴图文件
          pixelColor = this.texture2d(uvw.u, uvw.v, mtlInfo.map_Kd.file)
        }

        if (!normal) {
          normal = { x: fnormal[0], y: fnormal[1], z: fnormal[2] };
        }

        const n = vec3.fromValues(normal.x, normal.y, normal.z);
        const light0 = vec3.fromValues(0, 0, 1);//模拟一个在z轴的平行光，注意不是点光，没有四方发散作用
        const light1 = vec3.fromValues(0, 1, 0);//模拟一个在y轴的平行光
        const light2 = vec3.fromValues(1, 0, 0);//模拟一个在x轴的平行光

        densityWeight = (vec3.dot(n, light0) + vec3.dot(n, light1) + vec3.dot(n, light2)) / 1.8;

        const newZ = vertexAttr.zDepth;
        const oldZ = this.getZBuffer(x, y) || -Infinity;
        if (newZ >= oldZ) {//如果点的深度<以前点的深度，那么才绘制覆盖掉
          this.setPixel(x, y, pixelColor.r * densityWeight, pixelColor.g * densityWeight, pixelColor.b * densityWeight);
          this.setZBuffer(x, y, newZ);
        }
      }
    }

    //this.drawLine(bbox.x0, bbox.y0, bbox.x1, bbox.y1, 128, 0, 0);//绘制aabb的对角线
  }

  _drawWireframe(points = []) {
    //先依次绘制各点连接的线
    for (var i = 0; i < points.length - 1; i++) {
      const pFrom = points[i].__verticeWindowPosition;
      const pTo = points[i + 1].__verticeWindowPosition;
      pFrom && pTo && this.drawLine(pFrom[0], pFrom[1], pTo[0], pTo[1]);
    }

    //连接尾部点与首点
    const pf = points[points.length - 1].__verticeWindowPosition;
    const pe = points[0].__verticeWindowPosition;
    this.drawLine(pf[0], pf[1], pe[0], pe[1]);
  }

  flush() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
export { Canvas };
