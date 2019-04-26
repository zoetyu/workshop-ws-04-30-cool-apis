import React from 'react';
import ReactDOM from 'react-dom';
import FormData from 'form-data';

import Recorder from './components/Recorder';
import Output from './components/Output';
import './style.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      audioBlob: null,
      text: '',
      confidenceLevel: null,
      audioState: 'click the microphone to record some audio!',
    };
  }

  getAudioBlob = (blob, url) => {
    this.setState({
      audioBlob: blob,
    });

    this.sendRequest();
  }

  microphoneStarted = () => {
    console.log('microphone started');
    this.setState({
      audioState: 'ooh thank u for talking. it would be cool if we could recognize your words in real time, but we haven\'t learned web sockets yet!',
    });
  }

  // adapted from: https://github.com/collab-project/videojs-record/issues/17
  sendRequest = () => {
    this.setState({
      audioState: 'sending a request to IBM Watson...',
    }, () => {
      const URL = 'http://localhost:9090/';

      const formData = new FormData();
      formData.append('file', this.state.audioBlob, 'test.webm');

      const request = new XMLHttpRequest();

      request.onload = () => {
        const outputFromIBM = request.response.results[0].alternatives[0];

        this.setState({
          text: outputFromIBM.transcript,
          confidenceLevel: outputFromIBM.confidence,
          audioState: null,
        });
      };

      request.open('POST', URL, true);
      request.responseType = 'json';
      request.send(formData);
    });
  }

  render() {
    return (
      <div>
        <Recorder microphoneStarted={this.microphoneStarted} sendAudioBlob={this.getAudioBlob} />
        <Output audioState={this.state.audioState} text={this.state.text} confidenceLevel={this.state.confidenceLevel} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
