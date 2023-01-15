import ObjFileParser from 'obj-file-parser';

function ObjParser(txt){
    const objFile = new ObjFileParser(txt);
    const output = objFile.parse(); // s

    const myScene = toMyScene(output);
    console.log("origin obj",myScene);
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
            vertices: []
        }

        for(const v of obj.vertices){
            m.vertices.push([v.x,v.y,v.z]);
        }

        scene.models.push(m);
    }

    return scene;
}

window.ObjParser = ObjParser;
export {ObjParser};
