import React, { Component } from 'react';
import Photos from './components/photos';


class App extends Component {

  state = {
    photos: []
  }

  componentDidMount() {
    fetch('http://localhost:5000/photos/')
    .then(res => res.json())
    .then((data) => {
      this.setState({ photos: data })
    })
    .catch(console.log)
  }

  render() {
    return (
      <Photos photos={this.state.photos} />
    );
  }
}

export default App;
