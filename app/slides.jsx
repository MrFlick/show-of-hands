import React from 'react';

export default class SlideView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {slides: [], presenterSlideId:0, viewSlideIndex:0, syncSlides:true};
        this.socket = props.socket;
        this.history = props.history;
        this.socket_events = {    
            "presenter slide": (slide) => this.setPresenterSlide(slide),
            "slides": (slides) => this.setSlides(slides),
        }
        this.handleSyncClick = this.handleSyncClick.bind(this)
        this.handleSlideClick = this.handleSlideClick.bind(this)
        this.handleNextSlideClick = this.handleNextSlideClick.bind(this)
        this.handlePrevSlideClick = this.handlePrevSlideClick.bind(this)
    }
    findSlideIndex(slide_id) {
        return this.state.slides.findIndex(x => x.slide_id==slide_id)
    }
    handleSyncClick() {
        this.setState(prevState => ({
            syncSlides: !prevState.syncSlides
          }), ()=>{
            if (this.state.syncSlides) {
                let index = this.findSlideIndex(this.state.presenterSlideId);
                this.setState({ viewSlideIndex: index});
            }
          })
    }
    handleSlideClick(slide_id) {
        let index = this.findSlideIndex(slide_id);
        this.setState({viewSlideIndex: index, syncSlides: false});
    }
    handleNextSlideClick() {
        this.setState(prevState => {
            if(prevState.viewSlideIndex < prevState.slides.length-1) {
                return {viewSlideIndex: prevState.viewSlideIndex + 1, syncSlides: false}
            }
        })
    }
    handlePrevSlideClick() {
        this.setState(prevState => {
            if(prevState.viewSlideIndex > 0) {
                return {viewSlideIndex: prevState.viewSlideIndex - 1, syncSlides: false}
            }
        })
    }
    setPresenterSlide(slide) {
        let slide_id = slide.slide_id;
        this.setState(prevState => {
            let newState = {presenterSlideId: slide_id};
            if(prevState.syncSlides) {
                let index = this.findSlideIndex(slide_id);
                newState.viewSlideIndex = index;
            }
            return newState;
        })
    }
    setSlides(slides) {
        this.setState({slides: slides});
    }
    getViewSlide() {
        return this.state.slides[this.state.viewSlideIndex];
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.socket.emit("request slides", {});
        this.socket.emit("request presenter slide", {});
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        let viewSlide = this.getViewSlide()
        return <div className="row">
            <div className="col-12">
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                <h2>Slides</h2>
                <div style={{textAlign: "right"}}><label htmlFor="presenter_sync">Sync With Presenter</label> <input type="checkbox" id="presenter_sync" checked={this.state.syncSlides} onChange={this.handleSyncClick}/></div>
                {viewSlide && <div className="current-slide"  style={{gridColumn: "1/3"}}>
                    <div style={{display: "grid", gridTemplateColumns: "25px auto 25px"}}>  
                        <button onClick={this.handlePrevSlideClick}><i className="fa fa-chevron-left"></i></button>
                        <Slide slide={viewSlide} socket={this.socket} />
                        <button onClick={this.handleNextSlideClick}><i className="fa fa-chevron-right"></i></button>
                    </div>
                </div>}
                <div style={{gridColumn: "1/3"}}>
                    <SlideList slides={this.state.slides} socket={this.socket} onClick={this.handleSlideClick}/>
                </div>
                </div>
            </div>
        </div>
    }
}

function SlideList(props) {
    let socket = props.socket;
    let slides = props.slides;
    if (slides.length > 0) {
        return <div className="slide-list">{slides.map((slide) => {
            return <Slide key={slide.slide_id} slide={slide} socket={socket} onClick={props.onClick} thumb={true}/>
        })}</div>
    } else {
        return <p>No slides found</p>
    }
}

function Slide(props) {
    if (props.slide) {
        let url = props.slide.url;
        if (props.thumb && props.slide.thumb_url) {
            url = props.slide.thumb_url;
        }
        return <img src={url} onClick={() => {if(props.onClick) props.onClick(props.slide.slide_id)}} />
    } else {
        return null
    }
}