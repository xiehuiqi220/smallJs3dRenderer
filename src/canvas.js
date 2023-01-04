import { CHANNEL_COUNT } from "./constants";

class Canvas {
  constructor(canv, w = 800, h = 600) {
    this.width = canv.width = w;
    this.height = canv.height = h;
    this.ctx = canv.getContext("2d");
    this.clear();
  }

  drawXY() {
    this.drawLine(0, this.height / 2, this.width, this.height / 2, "red");
    this.drawLine(this.width / 2, 0, this.width / 2, this.height, "green");
  }

  clear() {
    //把画布全所有像素设置为#000
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawXY();
  }

  //绘制一个顶点，用圆圈代替
  drawPoint(x, y, label = "") {
    const ctx = this.ctx;
    const R = 3;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    if (label !== undefined) {
      ctx.font = "20px";
      ctx.fillText(label, x + 10, y + 10);
    }
    ctx.fill();
  }

  //绘制一条直线
  drawLine(x0, y0, x1, y1, color = "#fff") {
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  flush() {}
}
export { Canvas };
