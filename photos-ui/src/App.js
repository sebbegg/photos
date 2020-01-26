import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Gallery from "./components/gallery";
import Navbar from "./components/navbar";
import SlideShow from "./components/slideshow";

class App extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/ui/slideshow">
                        <SlideShow />
                    </Route>
                    <Route path="/ui/gallery">
                        <Navbar />
                        <Gallery />
                    </Route>
                    <Route>
                        <p>Nothing here</p>
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;
