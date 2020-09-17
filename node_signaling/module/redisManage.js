const redis = require("redis");
var RedisClustr = require('redis-clustr');
const redis2 = require("ioredis");

var _client;
var _rd;
var _cluster ;

function initializeRedis(ip, port, password) {
  _rd = new RedisClustr({
    servers: [
      {
        host: '192.168.64.77',
        port: 6001,
        db: '0',
      },
      // {
      //   host: '172.18.0.1',
      //   port: 6002,
      //   db: '0',
      //   password: ""
      // },
      // {
      //   host: '172.18.0.1',
      //   port: 6003,
      //   db: '0',
      //   password: ""
      // },
      // {
      //   host: '172.18.0.1',
      //   port: 6004,
      //   db: '0',
      //   password: ""
      // },
      // {
      //   host: '172.18.0.1',
      //   port: 6005,
      //   db: '0',
      //   password: ""
      // },
      // {
      //   host: '172.18.0.1',
      //   port: 6006,
      //   db: '0',
      //   password: ""
      // },
    ],
    // slotInterval: 1000, 
    // maxQueueLength: 100, 
    // queueShift: false,
    // wait: 5000,
    slaves: 'share',
    createClient: function(port,host,options) {
      console.log(port,host);
      //return require('redis').createClient(port, host, options);
      //_client = require('redis').createClient("redis://" + "" + ":" + "" + "@" +  host + ":" + port,options);
      return redis.createClient(port, "192.168.64.77", options);
      //return redis.createClient("redis://" + "" + ":" + "" + "@" +  host + ":" + port,options);
      //return redis.createClient("redis://" + "" + ":" + "" + "@" +  "172.18.0.1" + ":" + "6003");
    }
  });
}

// function initializeRedis(ip, port, password) {
//   _cluster = new redis2.Cluster([
//       {
//         host: '192.168.64.77',
//         port: 6001,
//         db: '0',
//         password : "root"
//       },
//       {
//         host: '192.168.64.77',
//         port: 6002,
//         db: '0',
//         password : "root"
//       },
//       {
//         host: '192.168.64.77',
//         port: 6003,
//         db: '0',
//         password : "root"
//       },
//       {
//         host: '192.168.64.77',
//         port: 6004,
//         db: '0',
//       },
//       {
//         host: '192.168.64.77',
//         port: 6005,
//         db: '0',
//       },
//       {
//         host: '192.168.64.77',
//         port: 6006,
//         db: '0',
//       },
//   ])
// }

function setSimple(key,value){
  _rd.set(key,value,function(err,res){
    if(err) console.log(err);
    console.log(res);
  });
}


function getSimple(key){
  //_cluster.set(key,value)
  _rd.get(key, function(err,data) {
    if (err) console.log(err)
    console.log(data);
  });
}

exports.initializeRedis = initializeRedis;
exports.setSimple = setSimple;
exports.getSimple = getSimple;
