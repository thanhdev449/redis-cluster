const NotifyMessage = require("./notify-message.js");

class OnlineMessage extends NotifyMessage {
    constructor(roomName, uid) {
        super("online");

        this._roomName = roomName;
        this._uid = uid;
    }

    toJson() {
        return {
            "event": this._event,
            "content": {
                "room_name": this._roomName,
                "uid": this._uid
            }
        };
    }
}

module.exports = OnlineMessage;