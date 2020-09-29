const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator  = require('javascript-obfuscator');
let arr_path = ['module'] ;
let arr_filename = [];
let tmp_str = ''

function handleObfuscation(){
    readAllFile();
}

function readAllFile(){
    arr_path.forEach(item => {
        let path_tmp = configPath(item);
        countFilesInFolder(path_tmp)
    });
    handleFile(arr_filename);
    //console.log(arr_filename);
}

function countFilesInFolder(path_tmp) {
    let arr_file_tmp = []
    fs.readdirSync(path_tmp).forEach((file) => {
        if(checkFileInFolder(file)){
            arr_filename.push(path.join(path_tmp, "/" + file));
        }else{
            fs.readdirSync(path.join(path_tmp, "/" + file)).forEach((file2) => {
                if (checkFileInFolder(file2)) {
                    arr_filename.push(path.join(path_tmp, "/" + file2));
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
    //return arr_file_tmp;
}

function readFile(pathFull){
    return new Promise((resolve,reject) => {
        fs.readFile(pathFull,"UTF-8",function(err,data){
            if (err) reject(err);
            resolve(data);
        })
    })
}

function handleFile(arr_filename){
    let data_tmp = '';
   for (let i = 0; i < arr_filename.length; i++) {
       const item = arr_filename[i];
       readFile(item)
       .then(res =>    console.log(res))
       .catch(err => console.log(err))
       //console.log(data_tmp);
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