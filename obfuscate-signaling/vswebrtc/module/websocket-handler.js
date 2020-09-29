const io = require("socket.io");
const redis = require('socket.io-redis');

const _log = require("../util/log.js");

const User = require("../object/user.js");

const RoomMessage = require("../object/message/in_room_message/room-message.js");

const EnterFailMessage = require("../object/message/notify_message/enter-fail-message.js");
const ExitFailMessage = require("../object/message/notify_message/exit-fail-message.js");
const OnlineMessage = require("../object/message/notify_message/online-message.js");
const OfflineMessage = require("../object/message/notify_message/offline-message.js");

var _io;
var _userManager;

function handle(webServer, redisServerInfo, userManager) {
  _io = io.listen(webServer)
  //using redis adapter
  _io.adapter(redis(redisServerInfo));

  _userManager = userManager;
  _io.sockets.on('connection', handleEvent);
}

//----------
function handleEvent(socket) {
  _log.writeServerLog(1, socket.id + " connected!");

  socket.on('error', function (err) {
    _log.writeServerLog(3, "Server error: " + err.message);
  });

  socket.on('online', function (data) {
    _userManager.updateUidvsSocket(data.uid, socket.id).then(data => {
      if (data.rooms) {
        for (roomName of data.rooms) {
          let onlineMsg = new OnlineMessage(roomName, data.uid);
          onlineMsg = onlineMsg.toJson();
          onlineMsg.room_name = roomName;
          broadcastSignalToRoom('notify', socket, onlineMsg, false);
        }
      }
    });
  });

  socket.on('re-connect', function (data) {
    _log.writeServerLog(1, socket.id + " reconnect!");
    _userManager.getRoomIdsFromUid(data.uid, socket.id).then(roomNames => {
      if (roomNames) {
        for (roomName of roomNames) {
          _log.writeServerLog(1, data.uid + " re-joins room [" + roomName + "] with socket:" + socket.id);
          _io.of('/').adapter.remoteJoin(socket.id, roomName, (err) => {
            if (err) {
              _log.writeServerLog(3, data.uid + " re-joins room fail. " + err.message);
            }
          });
        }
      }
    });
  });

  socket.on('enter', function (new_member) {
    let roomName = new_member.room_name;
    let newMember = new User(new_member.uid, new_member.nick_name, new_member.status, new_member.info);

    _userManager.addUserToRoom(roomName, newMember.uid, newMember)
      .then(() => {
        _io.of('/').adapter.remoteJoin(socket.id, roomName, (err) => {
          if (err) {
            _log.writeServerLog(3, newMember.uid + " joins room [" + roomName + "] fail. " + err.message);
          } else {
            _log.writeServerLog(1, newMember.uid + " joins room [" + roomName + "] success with socket:" + socket.id);
            _userManager.getMembersOfRoom(roomName)
              .then(data => {
                const {
                  info,
                  members
                } = data;
                let joinMsg;
                if (info) {
                  joinMsg = new RoomMessage(roomName, newMember.uid, info);
                } else {
                  joinMsg = new RoomMessage(roomName, newMember.uid);
                }

                joinMsg.joinedMember = newMember;
                for (let uid in members) {
                  joinMsg.addMember(members[uid]);
                }
                broadcastSignalToRoom('room', socket, joinMsg.toJson(), true);
              }).catch((err) => {
                _log.writeServerLog(3, newMember.uid + " creates room [" + roomName + "] fail. " + err.message);

                let joinFailMsg = new EnterFailMessage(roomName, errorCode.message);
                sendSignalFromServer('notify', socket, joinFailMsg.toJson());
              });
          }
        });
        _userManager.updateUidToRoomIds(new_member.uid, roomName, true);
      })
      .catch((errorCode) => {
        _log.writeServerLog(3, newMember.uid + " creates room [" + roomName + "] fail. " + errorCode.message);

        let joinFailMsg = new EnterFailMessage(roomName, errorCode.message);
        sendSignalFromServer('notify', socket, joinFailMsg.toJson());
      });
  });

  socket.on('exit', function (info) {
    var roomName = info.room_name;
    var uid = info.uid;

    var currentUser;

    _userManager.getUserFromRoom(roomName, uid)
      .then((user) => {
        if (user == null) {
          throw (uid + " leave room [" + roomName + "] fail. Not in this room");
        } else {
          currentUser = user;
          _userManager.removeUserFromRoom(roomName, uid)
            .then(() => {
              _userManager.getMembersOfRoom(roomName)
                .then(data => {
                  const {
                    info,
                    members
                  } = data;
                  let leaveMsg;
                  if (info) {
                    leaveMsg = new RoomMessage(roomName, uid, info);
                  } else {
                    leaveMsg = new RoomMessage(roomName, uid);
                  }

                  leaveMsg.leftMember = new User(uid, currentUser.nickName, 0, currentUser.info);
                  for (let uId in members) {
                    leaveMsg.addMember(members[uId]);
                  }
                  broadcastSignalToRoom('room', socket, leaveMsg.toJson(), true);
                  _io.of('/').adapter.remoteLeave(socket.id, roomName, (err) => {
                    if (err) {
                      _log.writeServerLog(3, uid + " leaves room [" + roomName + "] fail with socket:" + socket.id + " - error:" + err.message);
                    } else {
                      _log.writeServerLog(1, uid + " leaves room [" + roomName + "] success with socket:" + socket.id);
                    }
                  });
                })
                .catch((errorCode) => {
                  _log.writeServerLog(3, errorCode);

                  let leaveFailMsg = new ExitFailMessage(roomName, "Not in this room");
                  sendSignalFromServer('notify', socket, leaveFailMsg.toJson());
                });

              _userManager.updateUidToRoomIds(uid, roomName, false);
            });
        }
      })
      .catch((errorCode) => {
        _log.writeServerLog(3, errorCode);

        let leaveFailMsg = new ExitFailMessage(roomName, "Not in this room");
        sendSignalFromServer('notify', socket, leaveFailMsg.toJson());
      });
  });

  socket.on('message', function (message) {
    if (!message) return;
    if (message.send_to) {
      _userManager.getSocketId(message.send_to)
        .then((receiverSocketId) => {
          sendSignalToTargetInRoom('message', socket, receiverSocketId, message);
        })
        .catch(() => {
          _log.writeServerLog(2, message.from + " send message fail. Receiver " + message.send_to + " doesn't exist");
        });
    } else {
      broadcastSignalToRoom('message', socket, message, false);
    }
  });

  socket.on('video_chat', function (message) {
    if (!message) return;
    _userManager.getSocketId(message.send_to)
      .then((receiverSocketId) => {
        sendSignalToTargetInRoom('video_chat', socket, receiverSocketId, message);
      })
      .catch(() => {
        _log.writeServerLog(2, message.from + " send message fail. Receiver " + message.send_to + " doesn't exist");
      });
  });

  socket.on('disconnect', function () {
    _userManager.updateUidvsSocket(null, socket.id).then(data => {
      if (data && data.rooms) {
        for (roomName of data.rooms) {
          let offlineMsg = new OfflineMessage(roomName, data.uid);
          offlineMsgJson = offlineMsg.toJson();
          offlineMsgJson.room_name = roomName;
          broadcastSignalToRoom('notify', socket, offlineMsgJson, true);
        }
      }
    });
    _log.writeServerLog(0, socket.id + " disconnected!");
  });
}

//----------
function broadcastSignalToRoom(emitType, socket, message, includeMe) {
  if (message.room_name) {
    try {
      if (includeMe) {
        _io.sockets.in(message.room_name).emit(emitType, message);
      } else {
        socket.broadcast.to(message.room_name).emit(emitType, message);
      }
      _log.writeServerLog(0, (message.from ? message.from : 'server') + " broadcasts <" + emitType + ">: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "broadcastSignalToRoom error: " + e.message);
    }
  }
}

function sendSignalToTargetInRoom(emitType, socket, target, message) {
  if (target) {
    try {
      socket.to(target).emit(emitType, message);
      _log.writeServerLog(0, message.from + " send to " + target + " <" + emitType + ">: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "sendSignalToTargetInRoom error: " + e.message);
    }
    return;
  }
}

function sendSignalFromServer(emitType, targetSocket, message) {
  if (targetSocket) {
    try {
      targetSocket.emit(emitType, message);
      _log.writeServerLog(0, "Server send msg: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "sendSignalFromServer error: " + e.message);
    }
    return;
  }
}

//----------      
exports.handle = handle;