import ObjFileParser from 'obj-file-parser';

function ObjParser(txt){
    const objFile = new ObjFileParser(txt);
    const output = objFile.parse(); // s
    console.log("origin obj",output);

    const myScene = toMyScene(output);
    return myScene;
}

const toMyScene = function(objJSON){
    const scene = {
        models:[]
    };

    if(!objJSON.models || objJSON.models.length == 0){
        alert("没有找到物体");
        return false;
    }

    for(var obj of objJSON.models){
        const m = {
            id: obj.name || "",
            vertices: [],
            lines: [],
            faces: []
        }

        for(const v of obj.vertices){
            m.vertices.push([v.x,v.y,v.z]);
        }
        for(const l of obj.lines){
            m.lines.push([l[0].vertexIndex - 1,l[1].vertexIndex - 1]);//obj中index从1开始，所以要减去1
        }

        for(const f of obj.faces){
            f.vertices.map( v=>v.v = v.vertexIndex - 1);//obj中index从1开始，所以要减去1
            m.faces.push(f);
        }

        scene.models.push(m);
    }

    return scene;
}

window.ObjParser = ObjParser;
export {ObjParser};
