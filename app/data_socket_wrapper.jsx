
export class SocketDataWrapper {
    constructor(type, socket, onchange=null, options={}) {
        this.type = type
        this.idfield = type + "_id"
        this.socket = socket
        this.onchange = onchange
        this.collection = []
        this.listenStart = this.listenStart.bind(this)
        this.listenStop = this.listenStop.bind(this)
        this.request = this.request.bind(this)
        this.requestAdd = this.requestAdd.bind(this)
        this.requestDelete = this.requestDelete.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.handleNew = this.handleNew.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleRemove = this.handleRemove.bind(this)
        this.handleOnChange = this.handleOnChange.bind(this)
        this.socket_events = {
            [`${type} list`]: this.handleRefresh,
            [`new ${type}`]: this.handleNew,
            [`update ${type}`]: this.handleUpdate,
            [`remove ${type}`]: this.handleRemove,
        }
        this.message_names = {
            add: `add ${type}`,
            update: `update ${type}`,
            delete: `delete ${type}`,
        }
    }
    listenStart() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
    }
    listenStop() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    request(type, item) {
        if (this.message_names[type]) {
            this.socket.emit(this.message_names[type], item)
        } else {
            throw("Unrecognized message type: " + type)
        }
    }
    requestAdd(item) {
        this.request("add", item)
    }
    requestUpdate(item) {
        this.request("update", item)
    }
    requestDelete(item) {
        this.request("delete", item)
    }
    handleRefresh(item) {
        this.collection = [...item]
        this.handleOnChange()
    }
    handleNew(item) {
        this.collection = [...this.collection, item]
        this.handleOnChange()
    }
    handleUpdate(item) {
        this.collection = this.collection.map( x => {
            if (x[this.idfield] == item[this.idfield]) {
                return Object.assign(x, item)
            } else {
                return x
            }
        })
        this.handleOnChange()
    }
    handleRemove(item) {
        this.collection = this.collection.filter( x => {
            return x[this.idfield] !== item[this.idfield]})
        this.handleOnChange()
    }
    handleOnChange() {
        if (this.onchange) {
            this.onchange(this.collection)
        }
    }
}

export class AdminPollSocketData extends SocketDataWrapper {
    constructor(socket, onchange=null, options={}) {
        super("poll", socket, onchange, options)
        this.requestClosePoll = this.requestClosePoll.bind(this)
        this.requestOpenPoll = this.requestOpenPoll.bind(this)
        this.handlePollResponse = this.handlePollResponse.bind(this)
        this.message_names = Object.assign(this.message_names, {
            open: "open poll",
            close: "close poll",
        })
        this.socket_events = Object.assign(this.socket_events, {
            "new poll response": this.handlePollResponse,
            "open poll": this.handleUpdate,
            "close poll": this.handleUpdate,
        })
    }
    requestOpenPoll(item) {
        this.request("open", item)
    }
    requestClosePoll(item) {
        this.request("close", item)
    }
    handlePollResponse(item) {
        if(item.action=="insert") {
            this.collection = this.collection.map( x => {
                if (x[this.idfield] == item[this.idfield]) {
                    return Object.assign(x, {"response_count": x.response_count + 1})
                } else {
                    return x
                }
            })
            this.handleOnChange()
        }
    }
}