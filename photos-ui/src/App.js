import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
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
                        <Redirect to="/ui/gallery" />
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;
