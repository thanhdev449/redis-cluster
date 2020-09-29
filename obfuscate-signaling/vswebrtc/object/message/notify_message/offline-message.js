const NotifyMessage = require("./notify-message.js");

class OfflineMessage extends NotifyMessage {
    constructor(roomName, uid) {
        super("offline");

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

module.exports = OfflineMessage;