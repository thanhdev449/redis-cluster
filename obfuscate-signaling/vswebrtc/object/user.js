class User {
    constructor(uid, nickname, status, info) {
        this._uid = uid;
        this._nickname = nickname;
        this._status = status;
        this._info = info;
    }

    get uid() {
        return this._uid;
    }

    get nickName() {
        return this._nickname;
    }

    get status() {
        return this._status;
    }

    get info() {
        return this._info;
    }

    toJson() {
        return {
            "uid": this._uid,
            "nick_name": this._nickname,
            "status": this._status,
            "info": this._info
        }
    }
}

module.exports = User;