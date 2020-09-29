const redis = require("redis");

const User = require("../object/user.js");

var _client;

function initializeRedis(ip, port) {
  _client = redis.createClient(
    "redis://" + "" + ":" + "" + "@" + ip + ":" + port
  );
}

function getMembersOfRoom(roomName) {
  return new Promise(function (resolve, reject) {
    const members = {};
    let key_roomName = `${roomName}:*`;
    _client.keys(key_roomName, (err, users_in_room) => {
      for (let user_hash of users_in_room) {
        _client.hmget(user_hash, 'uid', 'nickname', 'status', 'info', (err, user_data) => {
          const [uid, nickname, status, infos] = user_data
          try {
            let info = JSON.parse(infos);
            let user_obj = new User(
              uid,
              nickname,
              status,
              info
            );
            members[user_data[0]] = user_obj;
          } catch (err1) {
            reject(err1);
          }
        });
      }

      try {
        _client.hget('RoomInfo', roomName, (err, infos) => {
          let info = JSON.parse(infos);
          resolve({
            info,
            members
          });
        });
      } catch (err2) {
        reject(err2);
      }
    });
  });
}

function updateUidvsSocket(uid, socketId) {
  return new Promise((resolve, reject) => {
    if (uid) { //add
      _client.hdel('socket2uid', socketId);
      _client.hset('uid2socket', uid, socketId);
      _client.hset('socket2uid', socketId, uid);

      getRoomIdsFromUid(uid).then(rooms => {
        resolve({
          uid,
          rooms
        });
      });

      updateStatusToAllRooms(uid, 1); //online
    } else { //remove
      _client.hget('socket2uid', socketId, (err, uid) => {
        if (err) {
          reject(err);
        } else {
          _client.hdel('socket2uid', socketId);

          _client.hget('uid2socket', uid, (err, currSocketId) => {
            if (currSocketId == socketId) {
              _client.hdel('uid2socket', uid);

              getRoomIdsFromUid(uid).then(rooms => {
                resolve({
                  uid,
                  rooms
                });
              });
    
              updateStatusToAllRooms(uid, 0); //offline
            }
            else {
              resolve();
            }
          });
        }
      });
    }
  });
}

function updateStatusToAllRooms(uid, status) {
  let key_uid = `${uid}:*`;
  _client.keys(key_uid, (err, key_uids) => {
    for (let key_uid of key_uids) {
      let roomName = key_uid.split(':')[1];
      let key_roomName = `${roomName}:${uid}`;
      _client.keys(key_roomName, (err, user_hashs) => {
        for (let user_hash of user_hashs) {
          _client.hmget(user_hash, 'uid', 'nickname', 'info', (err, user_data) => {
            const [uid, nickname, infos] = user_data
            try {
              _client.hmset(
                user_hash,
                "uid",
                uid,
                "nickname",
                nickname,
                "status",
                status,
                "info",
                infos
              );
            } catch (err) {
              reject(err);
            }
          });
        }
      });
    }
  });
}

function updateUidToRoomIds(uid, roomName, isJoin) {
  return new Promise((resolve, reject) => {
    if (isJoin) {
      _client.hset(uid + ':' + roomName, 'room_name', roomName);
    } else {
      _client.DEL(uid + ':' + roomName);
    }
  });
}

function getRoomIdsFromUid(uid) {
  return new Promise((resolve, reject) => {
    let key_uid = `${uid}:*`;
    _client.keys(key_uid, (err, key_uids) => {
      let roomNames = [];
      for (let key_uid of key_uids) {
        roomNames.push(key_uid.split(':')[1]);
      }
      resolve(roomNames);
    });
  });
}

function getSocketId(uid) {
  return new Promise((resolve, reject) => {
    _client.hget('uid2socket', uid, (err, socketId) => {
      resolve(socketId);
    });
  });
}

function addUserToRoom(roomName, uid, user) {
  return new Promise(function (resolve, reject) {
    let hashkey = roomName + ":" + uid;
    try {
      let user_info = JSON.stringify(user.info);
      _client.hmset(
        hashkey,
        "uid",
        uid,
        "nickname",
        user.nickName,
        "status",
        user.status,
        "info",
        user_info
      );
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function getUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = `${roomName}:${uid}`;
    _client.hmget(user_hash, 'uid', 'nickname', 'status', 'info', (err, user_data) => {
      if (err) {
        reject();
      }
      if (user_data && user_data.length) {
        const [uid, nickname, status, infos] = user_data
        try {
          let info = JSON.parse(infos);
          let user_obj = new User(
            uid,
            nickname,
            status,
            info
          );
          resolve(user_obj);
        } catch (e) {
          reject(e);
        }
      } else {
        reject();
      }
    });
  });
}

function removeUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = `${roomName}:${uid}`;
    _client.DEL(user_hash, (err, number) => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

//----------
exports.initializeRedis = initializeRedis;
exports.getMembersOfRoom = getMembersOfRoom;
exports.updateUidvsSocket = updateUidvsSocket;
exports.getSocketId = getSocketId;
exports.addUserToRoom = addUserToRoom;
exports.getUserFromRoom = getUserFromRoom;
exports.removeUserFromRoom = removeUserFromRoom;
exports.updateUidToRoomIds = updateUidToRoomIds;
exports.getRoomIdsFromUid = getRoomIdsFromUid;