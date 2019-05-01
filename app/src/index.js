import React from 'react';
import ReactDOM from 'react-dom';
import './style.scss';
import CircularProgress from '@material-ui/core/CircularProgress';
import Recorder from './components/Recorder';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      audioText: 'click the microphone to record some audio!',
      audioBlob: null,
    };
  }

  handleLoading = () => {
    if (this.state.loading) {
      return <CircularProgress color="secondary" />;
    }
    return <Recorder microphoneStarted={this.microphoneStarted} sendAudioBlob={this.getAudioBlob} />;
  }

  getAudioBlob = (blob) => {
    this.setState({
      audioBlob: blob,
    });

    this.sendRequest();
  }

  microphoneStarted = () => {
    this.setState({
      audioText: 'listening...',
    });
  }

  sendRequest = () => {
    console.log('sending a request to IBM...');
  }

  render() {
    return (
      <div className="container">
        {this.handleLoading()}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
