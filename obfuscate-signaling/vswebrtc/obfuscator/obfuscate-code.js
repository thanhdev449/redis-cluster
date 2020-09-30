const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator  = require('javascript-obfuscator');
var arr_path = ['module','object','util'] ;
var arr_filename = [];
var _pathFile = "";

function handleObfuscation(){
    clearFileMin();
    readAllFile();
}

function clearFileMin(){
    _pathFile = configPath('public/vswebrtc-server.min.js');
    fs.writeFileSync(_pathFile,'')
}

function readAllFile(){
    arr_path.forEach(item => {
        let path_tmp = configPath(item);
        countFilesInFolder(path_tmp)
    });
    handleFile(arr_filename);
}

function countFilesInFolder(path_tmp) {
    fs.readdirSync(path_tmp).forEach((file) => {
        if(checkFileInFolder(file)){
            arr_filename.push(path.join(path_tmp, "/" + file));
        }else{
            fs.readdirSync(path.join(path_tmp, "/" + file)).forEach((file2) => {
                if (checkFileInFolder(file2)) {
                    arr_filename.push(path.join(path_tmp, "/" + file + "/" + file2));
                }else{
                    fs.readdirSync(path.join(path_tmp, "/" + file + "/" + file2)).forEach((file3) => {
                        if (checkFileInFolder(file3)) {
                            arr_filename.push(path.join(path_tmp, "/" + file + "/" + file2 + "/"  + file3));
                        } 
                    })
                }
            });
        }
    });
}

function handleFile(arr_filename){
   for (let i = 0; i < arr_filename.length; i++) {
    const item = arr_filename[i];
    console.log(item)
    let str_code =  fs.readFileSync(item,"UTF-8");
    str_code += "\n";
    let dataConvert = JavaScriptObfuscator.obfuscate(str_code.toString());
    let str_code_tmp = fs.readFileSync(_pathFile,"UTF-8");
    str_code_tmp += dataConvert.getObfuscatedCode();
    fs.writeFileSync(_pathFile,str_code_tmp)
   }
}

function configPath(subPath){
    let convertPath = '/../' + subPath;
    return path.join(__dirname,convertPath);
}

function checkFileInFolder(file){
    if (file.indexOf(".") !== 0 && file.slice(-3) === ".js") {
        return true;
    }
    return false;
}

exports.handleObfuscation = handleObfuscation;
exports.clearFileMin = clearFileMin;