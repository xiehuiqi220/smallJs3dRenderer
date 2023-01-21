import { CHANNEL_COUNT } from "./constants";
import { rrgb } from "./util";
import { log } from "./util";

class Canvas {
  constructor(canv, w = 800, h = 600) {
    this.width = canv.width = w;
    this.height = canv.height = h;
    this.ctx = canv.getContext("2d",{willReadFrequently:true});
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
    x= parseInt(x);y=parseInt(y);
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
      [x0, y0] = [y0, x0];
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
  drawFace(points = [], wireframe = false, color = '#fff') {    
    for (var i = 0; i < points.length-1; i++) {
      const pFrom = points[i].__verticeWindowPosition;
      const pTo = points[i+1].__verticeWindowPosition;
      pFrom && pTo && this.drawLine(pFrom[0], pFrom[1],pTo[0],pTo[1]);
    }

    //连接尾部点与首点
    const pf = points[points.length - 1].__verticeWindowPosition;
    const pe = points[0].__verticeWindowPosition;
    this.drawLine(pf[0], pf[1],pe[0],pe[1]);
  }

  flush() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
export { Canvas };
