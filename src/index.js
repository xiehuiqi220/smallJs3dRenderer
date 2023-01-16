import "./styles.css";
import { SceneExample } from "./scene.js";
import { Renderer } from "./renderer";
import { Y_UP } from "./constants";
import { log } from "./util";
import { Canvas } from "./canvas.js";
import { mat4, vec3, vec4 } from "gl-matrix";
import * as dat from 'dat.gui';

const gui = new dat.GUI();
const PARAMS = {
  projectionMode: 1, //投影模式，1透视 0正交
  showLog: false, //显示日志
  cameraX: 0,
  cameraY: 0,
  cameraZ: 10,
  fieldOfView: 45,
  vertexSize: 2,
  wireframe: false
};
let Scene = null;

gui.add(PARAMS, 'projectionMode', { "透视": 1, "正交": 0 }).onChange((v) => {
  setProjectionMode();
});
gui.add(PARAMS, "showLog").onChange((v) => {
  myRender.showLog = v;
});
gui.add(PARAMS, "cameraX", -100, 100).onChange((v) => {
  setCamera();
});
gui.add(PARAMS, "cameraY", -100, 100).onChange((v) => {
  setCamera();
});
const ctrlCameraZ = gui.add(PARAMS, "cameraZ", 0, 200).onChange((v) => {
  setCamera();
});
gui.add(PARAMS, "fieldOfView", 30, 90).onChange((v) => {
  setProjectionMode();
});
gui.add(PARAMS, "vertexSize",0,5).onChange((v) => {
  myRender.vertexSize = v;
});
gui.add(PARAMS, "wireframe").onChange((v) => {
  myRender.wireframe = v;
});

let canv = document.getElementById("myCanvas");
//创建无任何颜色的纯净画布
const CAN_WIDTH = 1200;
const CAN_HEIGHT = 800;
const ASPECT = CAN_WIDTH / CAN_HEIGHT;
const myCanvas = new Canvas(canv, CAN_WIDTH, CAN_HEIGHT);
const myRender = new Renderer(myCanvas, {
  log: PARAMS.log,
  wireframe: PARAMS.wireframe,
  vertexSize: PARAMS.vertexSize
});

const projectionMatrix = mat4.create();//投影矩阵
const viewMatrix = mat4.create();//摄影机（视图）矩阵
let cameraPosition = [0, 0, 0]; //摄影机位置，世界坐标，默认在原点
const ORIGIN = [0, 0, 0]; //摄影机朝向，指向世界坐标原点

//设置投影模式
function setProjectionMode() {
  if (PARAMS.projectionMode == 1) {

    const fieldOfView = (PARAMS.fieldOfView * Math.PI) / 180;
    const cameraNear = 1.0;
    const cameraFar = 20.0;

    mat4.perspective(
      projectionMatrix,
      fieldOfView,
      ASPECT,
      cameraNear,
      cameraFar
    );
  } else {
    const H = 4;
    mat4.ortho(projectionMatrix, -H * ASPECT, H * ASPECT, -H, H, 0.1, 100);
  }
}

//设置摄影机位置
function setCamera() {
  cameraPosition = [PARAMS.cameraX, PARAMS.cameraY, PARAMS.cameraZ];
}

//运行动画
function animate() {
  mat4.lookAt(viewMatrix, cameraPosition, ORIGIN, Y_UP);
  //console.log(viewMatrix);
  //console.log(projectionMatrix);

  myRender.render(Scene, viewMatrix, projectionMatrix);
  setTimeout(animate, 50);
}

function setSceneData(){
  Scene = SceneExample;

  //接收加载obj文件的信号，摄影机做适配，能看到物体
  window.addEventListener("changeScene",function(e){
    Scene = e.detail;
    const MAX_Y = Scene.__MAX_Y;
    const MIN_Y = Scene.__MIN_Y;

    const MAX_ABS_Y = Math.max(Math.abs(MAX_Y),Math.abs(MIN_Y));
    log("scene max abs Y",MAX_ABS_Y);
    const dist = MAX_ABS_Y / Math.tan(Math.PI * 45 / 360) * 1.1;//乘以倍数是增长dist，使得视野上下还有一些空间
    log("adapt cameraZ",dist);
    PARAMS.cameraZ = dist;
    ctrlCameraZ.updateDisplay();
    setCamera();
  });
}

//页面入口
(function main() {
  setCamera();
  setProjectionMode();
  setSceneData();
  animate();
})();
