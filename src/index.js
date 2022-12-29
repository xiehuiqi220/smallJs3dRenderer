import "./styles.css";
import { Scene } from "./scene.js";
import { Renderer } from "./renderer";
import { Y_UP } from "./constants";
import { Canvas } from "./canvas.js";
import { mat4, vec3, vec4 } from "gl-matrix";

let canv = document.getElementById("myCanvas");
//创建无任何颜色的纯净画布
const CAN_WIDTH = 800;
const CAN_HEIGHT = 500;
const myCanvas = new Canvas(canv, CAN_WIDTH, CAN_HEIGHT);

const fieldOfView = (45 * Math.PI) / 180;
const cameraNear = 1.0;
const cameraFar = 100.0;
const aspect = CAN_WIDTH / CAN_HEIGHT;

let projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fieldOfView, aspect, cameraNear, cameraFar);

const viewMatrix = mat4.create();
const cameraPos = [10, 10, 10]; //摄影机位置，世界坐标
const cameraDir = vec3.create(); //摄影机朝向，指向世界坐标原点

const myRender = new Renderer(myCanvas);
let offsetY = 0;

(function animate() {
  // vec3.add(cameraDir, [0, 0, 0], [0, offsetY, 0]);
  // mat4.lookAt(viewMatrix, cameraPos, cameraDir, Y_UP);

  myRender.render(Scene, viewMatrix);
  offsetY += 0.0;
  if (offsetY > 3) offsetY = 0;
  setTimeout(animate, 100);
})();
