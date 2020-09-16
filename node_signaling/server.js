console.log("-------------------------------");
console.log("/* Redis-Cluster Server */");
console.log("-------------------------------");


const _enviroment = require('./enviroment');
const app = require('express')();
const httpServer = require("http");
const _redis = require("./module/redisManage");
let webServer;
_redis.initializeRedis(_enviroment.configuration.REDIS_SERVER_1.host,_enviroment.configuration.REDIS_SERVER_1.port,_enviroment.configuration.REDIS_SERVER_1.password)
webServer = httpServer.createServer(app);

app.use('/users', function(){
    _redis.setSimple("thanh39","122");
});

app.use('/get-users', function(){
    _redis.getSimple("thanh39");
});

webServer.listen(_enviroment.configuration.PORT,function(){
    console.log("Listenning on "+_enviroment.configuration.PORT+"...");
});




