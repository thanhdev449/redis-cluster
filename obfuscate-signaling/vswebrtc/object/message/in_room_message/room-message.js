const InRoomMessage = require("./in-room-message.js");

class RoomMessage extends InRoomMessage {
    constructor(roomName, from, info) {
        super(roomName);

        this._from = from;
        this._members = [];
        this._info = info || undefined
    }

    addMember(member) {
        this._members.push(member);
    }

    set joinedMember(value) {
        this._joinedMember = value;
    }

    set leftMember(value) {
        this._leftMember = value;
    }

    toJson() {
        let jsonValue = { "room_name": this._roomName, "from": this._from, "members": [] };
        if (this._joinedMember == undefined)
            jsonValue.left_member = this._leftMember.toJson();
        else
            jsonValue.joined_member = this._joinedMember.toJson();

        for (let member of this._members) {
            jsonValue.members.push(member.toJson());
        }

        if (this._info) {
            jsonValue.info = this._info;
        }
        return jsonValue;
    }
}

module.exports = RoomMessage;