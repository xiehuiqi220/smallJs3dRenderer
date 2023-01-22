import { CHANNEL_COUNT } from "./constants";
import { rrgb, aabb, is_point_inside_convex_polygon, barycentric, lerpPoints } from "./util";
import { log } from "./util";

class Canvas {
  constructor(canv, w = 800, h = 600) {
    this.width = canv.width = w;
    this.height = canv.height = h;
    this.ctx = canv.getContext("2d", { willReadFrequently: true });
    this.imageData = null;
    this.clear();
  }

  showPerf(obj) {
    const duration = obj.duration;
    if (duration == 0) return;
    const fps = parseInt(1000 / duration);
    const ms = duration.toFixed(2);

    this.ctx.strokeStyle = "red";
    this.ctx.font = "12px Verdana";
    this.ctx.strokeText(`dur: ${ms} ms, fps: ${fps}`, 100, 20);
  }

  //绘制xy轴
  drawXY() {
    this.drawLine(0, this.height / 2, this.width, this.height / 2, 128, 0, 0);
    this.drawLine(this.width / 2, 0, this.width / 2, this.height, 0, 128, 0);
  }

  clear() {
    //把画布全所有像素设置为#000
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);

    log('clear');
    this.drawXY();
  }

  //绘制一个顶点，用圆圈代替
  setPixel(x, y, r = 255, g = 255, b = 255) {
    x = Math.round(x); //取整
    y = Math.round(y);
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

  //绘制面
  drawFace(points = [], wireframe = false, fcolor) {
    if (wireframe) {
      this._drawWireframe(points);
      return;
    }
    const bbox = aabb(points);

    //遍历bbox围绕的矩形，判断每一个点是不是在多边形里面
    for (var x = bbox.x0; x < bbox.x1; x++) {
      for (var y = bbox.y0; y < bbox.y1; y++) {
        let isInsider = false;//is_point_inside_convex_polygon({ x, y }, points);
        const params = barycentric([x, y], points);
        isInsider = params.every(i => i >= 0);//若每个参数都大于0，说明在三角形内

        if (!isInsider) {
          //this.setPixel(x, y, 255, 255, 255); //如果点在面里面，就绘制
          continue;//若点不在三角形内，则忽略
        }

        let vcolor = fcolor;//默认顶点颜色由参数指定
        //若未指定面顶点的颜色，则混合插值
        if (!fcolor) {
          vcolor = lerpPoints("color", params, points);
        }

        this.setPixel(x, y, vcolor.r, vcolor.g, vcolor.b); //如果点在面里面，就绘制
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
