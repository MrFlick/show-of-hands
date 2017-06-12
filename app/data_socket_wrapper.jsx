
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
        this.handeRemove = this.handeRemove.bind(this)
        this.handleOnChange = this.handleOnChange.bind(this)
        this.socket_events = {
            [`${type} list`]: this.handleRefresh,
            [`new ${type}`]: this.handleNew,
            [`update ${type}`]: this.handleUpdate,
            [`remove ${type}`]: this.handleUpdate,
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
        this.socket.emit(this.message_names[type], item)
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
                return item
            } else {
                return x
            }
        })
        this.handleOnChange()
    }
    handleRemove(item) {
        this.collection = this.collection.filter( x => {
            x[this.idfield] != item[this.idfield]})
        this.handleOnChange()
    }
    handleOnChange() {
        if (this.onchange) {
            this.onchange(this.collection)
        }
    }
}
