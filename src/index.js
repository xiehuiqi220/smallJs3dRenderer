import "./styles.css";
import { SceneExample } from "./scene.js";
import { Renderer } from "./renderer";
import { Y_UP } from "./constants";
import { log } from "./util";
import { Canvas } from "./canvas.js";
import { mat4 } from "gl-matrix";
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const DEFAULT_CAMERA_Z = 10;
//初始化gui
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const gui = new dat.GUI();
const PARAMS = {
  projectMode: 1, //投影模式，1透视 0正交
  showLog: false, //显示日志
  cameraX: 0,
  cameraY: 0,
  cameraZ: DEFAULT_CAMERA_Z,
  fieldOfView: 45,
  wireframe: false,
  randomFaceColor: false,
  autoRotate: true
};

let Scene = null;

gui.add(PARAMS, 'projectMode', { "Perspective 透视": 1, "Orthogonal 正交": 0 }).onChange((v) => {
  setProjectionMode();
});
gui.add(PARAMS, "showLog").onChange((v) => {
  myRender.showLog = v;
});
gui.add(PARAMS, "fieldOfView", 30, 90).onChange((v) => {
  setProjectionMode();
});
gui.add(PARAMS, "wireframe").onChange((v) => {
  myRender.wireframe = v;
});
gui.add(PARAMS, "randomFaceColor").onChange((v) => {
  myRender.randomFaceColor = v;
});
gui.add(PARAMS, "autoRotate");

let canv = document.getElementById("myCanvas");
//创建无任何颜色的纯净画布
const CAN_WIDTH = window._innerWidth || 800;
const CAN_HEIGHT = window._innerHeight || 600;
const ASPECT = CAN_WIDTH / CAN_HEIGHT;
const myCanvas = new Canvas(canv, CAN_WIDTH, CAN_HEIGHT);
const myRender = new Renderer(myCanvas, {
  log: PARAMS.log,
  wireframe: PARAMS.wireframe,
  vertexSize: PARAMS.vertexSize,
  randomFaceColor: PARAMS.randomFaceColor
});

const projectionMatrix = mat4.create();//投影矩阵
const viewMatrix = mat4.create();//摄影机（视图）矩阵
let cameraPosition = [0, 0, 0]; //摄影机位置，世界坐标，默认在原点
const ORIGIN = [0, 0, 0]; //摄影机朝向，指向世界坐标原点

//设置投影模式
function setProjectionMode() {
  if (PARAMS.projectMode == 1) {

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
let rotateDeg = 0;
function animate() {
  let t0 = performance.now();
  stats.begin();
  mat4.lookAt(viewMatrix, cameraPosition, ORIGIN, Y_UP);
  mat4.rotateY(viewMatrix, viewMatrix, rotateDeg += PARAMS.autoRotate ? duration>100 ? 1 : 0.01 : 0);
  //log(viewMatrix);
  //log(projectionMatrix);

  myRender.render(Scene, viewMatrix, projectionMatrix);
  const duration = (performance.now() - t0);
  stats.end();
  myCanvas.showPerf({ duration });
  requestAnimationFrame(animate);
}

function setSceneData() {
  Scene = SceneExample;

  //接收加载obj文件的信号，摄影机做适配，能看到物体
  window.addEventListener("changeScene", function (e) {
    Scene = e.detail;
    if(!Scene){
      Scene = SceneExample;
      PARAMS.cameraZ = DEFAULT_CAMERA_Z;
      setCamera();
      return;
    }
    const MAX_Y = Scene.__MAX_Y;
    const MIN_Y = Scene.__MIN_Y;

    const MAX_ABS_Y = Math.max(Math.abs(MAX_Y), Math.abs(MIN_Y));
    log("scene max abs Y", MAX_ABS_Y);
    const dist = MAX_ABS_Y / Math.tan(Math.PI * 45 / 360) * 1.1;//乘以倍数是增长dist，使得视野上下还有一些空间
    log("adapt cameraZ", dist);
    PARAMS.cameraZ = dist;
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
