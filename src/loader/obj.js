import ObjFileParser from './obj-file-parser';
import MtlFileParser from './mtl-file-parser';

function ObjParser(txt) {
    const objFile = new ObjFileParser(txt);
    const output = objFile.parse(); // s
    console.log("origin obj", output);

    const myScene = toMyScene(output);
    return myScene;
}

function MtlParser(txt){
    const m = new MtlFileParser(txt);
    const output = m.parse(); // s
    console.log("origin mtl", output);

    return output;
}

const toMyScene = function (objJSON) {
    if (!objJSON.models || objJSON.models.length == 0) {
        alert('no models found');
        return false;
    }
    if (!objJSON.models[0].vertices || objJSON.models[0].vertices.length == 0) {
        alert('no vertex found');
        return false;
    }

    const scene = {
        __MAX_Y: -Infinity,//场景中所有顶点Y坐标最大值，用于确定场景边界
        __MIN_Y: Infinity,//场景中所有顶点Y坐标最小值,
        materialLibraries: objJSON.materialLibraries || [],
        models: []
    };

    if (!objJSON.models || objJSON.models.length == 0) {
        alert("没有找到物体");
        return false;
    }

    let objIndex = 0;
    let totalVertexCount = 0; //累计顶点数
    let totalVertexNomalCount = 0; //累计顶点数
    let totalVertexUvCount = 0; //累计顶点数
    for (const obj of objJSON.models) {
        obj.__objIndex = objIndex;
        obj.__vertexFromIndex = totalVertexCount;//obj文件中，无论有多少个物体，顶点的索引都不断累积，所以要取到顶点实际索引，需要减去这个对象顶点的起始索引，才能拿到当前对象下以0开始的的顶点索引
        obj.__vertexNomalFromIndex = totalVertexNomalCount;//obj文件中，无论有多少个物体，顶点的索引都不断累积，所以要取到顶点实际索引，需要减去这个对象顶点的起始索引，才能拿到当前对象下以0开始的的顶点索引
        obj.__vertexUVFromIndex = totalVertexUvCount;//obj文件中，无论有多少个物体，顶点的索引都不断累积，所以要取到顶点实际索引，需要减去这个对象顶点的起始索引，才能拿到当前对象下以0开始的的顶点索引
        const m = {
            id: obj.name || "",
            vertices: [],
            lines: [],
            faces: [],
            vertexNormals:obj.vertexNormals,
            textureCoords:obj.textureCoords,
            __objIndex: objIndex
        }

        totalVertexNomalCount += obj.vertexNormals.length;
        totalVertexUvCount += obj.textureCoords.length;

        for (const v of obj.vertices) {
            totalVertexCount++;
            if (v.y > scene.__MAX_Y) {
                scene.__MAX_Y = v.y;
            }
            if (v.y < scene.__MIN_Y) {
                scene.__MIN_Y = v.y;
            }
            m.vertices.push([v.x, v.y, v.z]);
        }
        for (const l of obj.lines) {
            m.lines.push([l[0].vertexIndex - obj.__vertexFromIndex - 1, l[1].vertexIndex - obj.__vertexFromIndex - 1]);//obj中index从以前累积的顶点数开始，所以要减去vertexFromIndex
        }

        //把面中的索引变成相对索引
        for (const f of obj.faces) {
            f.vertices.map(v => {
                v.__vi = v.vertexIndex - obj.__vertexFromIndex - 1; //obj中index从1开始，所以要减去1
                v.__vni = v.vertexNormalIndex - obj.__vertexNomalFromIndex - 1; //obj中index从1开始，所以要减去1
                v.__vui = v.textureCoordsIndex - obj.__vertexUVFromIndex - 1; //obj中index从1开始，所以要减去1
            });

            m.faces.push(f);
        }

        objIndex++; //对象数量+1
        scene.models.push(m);
    }

    return scene;
}

window.ObjParser = ObjParser;
window.MtlParser = MtlParser;
export { ObjParser,MtlParser };
