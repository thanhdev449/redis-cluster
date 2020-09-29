const fs = require('fs');
const path = require('path');
var JavaScriptObfuscator  = require('javascript-obfuscator');

fs.readFile('./function/func-1.js',"UTF-8",function(err,data) {
    if(err) throw err;
    //console.log(data);
    var pathfull = path.join(__dirname ,"/function");
    fs.readdirSync(pathfull).filter(file => {console.log(file)})
    // var dataRevert = JavaScriptObfuscator.obfuscate(data);
    // fs.writeFile('./mintify/minify-func-1.min.js',dataRevert.getObfuscatedCode(),function(err,res){
    //     if (err) {
    //         throw err
    //     }
    //     console.log(res);
    //     console.log('file saved');
    // })
    
})