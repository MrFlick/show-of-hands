import React from 'react';

export default class Results extends React.Component { 
    constructor(props) {
        super(props)
        let poll_id = props.poll_id
        this.state = {
            poll_id: poll_id,
            responses: []
        }
        this.socket = props.socket
        this.socket_events = {
            "new poll response": (resp) => this.newResponse(resp),
            "poll responses list": (resp) => this.refreshResponses(resp),
            "poll detail": (resp) => this.refreshPoll(resp),
            "update poll": (resp) => this.refreshPoll(resp)
        }
    }
    newResponse(resp) {
        if (resp.poll_id == this.state.poll_id) {
            var r = {rowid: resp.rowid, response: resp.value}
            if (resp.action == "insert") {
                this.setState(previousState => ({
                    responses: [...previousState.responses, r]
                }))
            } else if (resp.action == "update") {
                this.setState(previousState => ({
                    responses: previousState.responses.map(function(x) {
                        if (r.rowid == x.rowid) {
                            return r;
                        } else {
                            return x;
                        }
                    })
                }))
            }
        }
    }
    refreshPoll(resp) {
        if (resp.poll_id == this.state.poll_id) {
            this.setState(resp);
        }
    }
    refreshResponses(resp) {
        if (resp.poll_id == this.state.poll_id) {
            this.setState({responses: resp.responses});
        }
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.socket.emit("request poll detail", {poll_id: this.state.poll_id});
        this.socket.emit("request poll responses list", {poll_id: this.state.poll_id});
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        let drawcomp = null;
        if (this.state.type=="multiple_choice") {
            drawcomp = <ChoiceBarPlot poll={this.state} responses={this.state.responses}/>
        } else if (this.state.type=="text") {
            drawcomp = <ResponseDump poll={this.state} responses={this.state.responses}/>
        } else if (this.state.type=="number"){
            drawcomp = <Histogram poll={this.state} responses={this.state.responses}/>
        } else if (this.state.type=="image") {
            drawcomp = <ImageList poll={this.state} responses={this.state.responses} 
                imglink={this.props.history.createHref({pathname:"/img"})}/>
        } else {
            drawcomp = <div>Type: {this.state.type}</div>
        }
        return <div><h2>{this.state.title || "Poll"}</h2>{drawcomp}</div>
    }
}

function count(ary, classifier) {
    return ary.reduce(function(counter, item) {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
}

function ResponseDump(props) {
    return <div>{props.responses.map((resp) => {
        return <p key={resp.rowid}>{resp.response}</p>
    })}</div>    
}

class ChoiceBarPlot extends React.Component {
    constructor(props) {
        super(props)
        this.summarizeStats = this.summarizeStats.bind(this);
    }
    summarizeStats(resps, poll) {
        var n = resps.length;
        var counts = count(resps, (x) => {return x.response} )
        var keys = (poll.options && poll.options.values) || Object.keys(counts)
        return keys.map((k) => {
            return {value: k, n: counts[k] || 0, p: counts[k]/n || 0}
        })
    }
    render() {
        let stats = this.summarizeStats(this.props.responses, this.props.poll);
        return <dl>{stats.map((x) => {
            return <dd className="percentage" key={x.value}><span className="text">{x.value} ({x.n})</span>
            <span className="bar" style={{width: (x.p*100) + "%"}}></span></dd>
        })}</dl>
    }
}

class Histogram extends React.Component {
    constructor(props) {
        super(props)
        this.state = {bins: 7}
        this.summarizeStats = this.summarizeStats.bind(this);
    }
    summarizeStats() {
        var resps = this.props.responses;
        var vals = resps.map((x) => x.response).map(parseFloat).filter((x) => !isNaN(x)).sort();
        var min = 0;
        var max = 0;
        var mean = 0;
        var bins = [];
        var empty = true;
        if (vals.length) {
            min = Math.min.apply(null, vals);
            max = Math.max.apply(null, vals);
            mean = vals.reduce((a,b) => (a+b))/vals.length;
            if (max-min>.001) {
                bins = Array(this.state.bins).fill(0);
                vals.forEach((x) => {
                    var b = Math.floor((x-min)/(max-min)*bins.length);
                    if (b > bins.length-1) {b = bins.length-1}
                    bins[b] = (bins[b] || 0) + 1;
                })
            } else {
                bins = [vals.length]
            }
            empty = false;
        }
        var r = (i) => {return Math.round((min+i*(max-min)/bins.length)*100)/100}
        var maxBins = Math.max.apply(null, bins.filter((x)=>!isNaN(x)));
        return {min: min, max: max, mean: mean, n: vals.length, 
            bins:bins.map((x, i)=>{return {n:x, p:x/maxBins, r:[r(i)+"-"+r(i+1)]}}), empty: empty}
    }
    render() {
        let stats = this.summarizeStats();
        if (stats.empty) {
            return <p>No responses</p>
        } else {
            return <div>
                <p>Mean: {stats.mean}, Min: {stats.min}, Max: {stats.max}</p>
                <dl>{stats.bins.map((x, i) => {
                return <dd className="percentage" key={i}><span className="text">{x.r} ({x.n})</span>
                <span className="bar" style={{width: (x.p*100) + "%"}}></span></dd>
            })}</dl></div>
            
        }        
    }
}

function Image(props) {
    if (props.value) {
        let url = (props.imglink || "") + "/" + props.value;
        return <img src={url} style={{maxWidth: props.maxWidth + "px"}}/>
    } else {
        return null
    }
}

class ImageList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {maxWidth: 400}
    }
    handleChange = (e) => {
        this.setState({maxWidth: e.target.value})
    }
    render() {
        return <div><input type="range" min="50" max="750" step="10" 
            value={this.state.maxWidth} onChange={this.handleChange}/>
        <div>{this.props.responses.map( (x,i) => {
            return <Image value={x.response} imglink={this.props.imglink} key={i} maxWidth={this.state.maxWidth}/>
        })}</div></div>
    }
}
