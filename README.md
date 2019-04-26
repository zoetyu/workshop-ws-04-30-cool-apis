# CS52 Workshops: Cool APIs!

![api gif](readme-content/gifs/api1.gif)

The Internet is an amazing place. In part because things like this exist:

![puppy gif](readme-content/gifs/puppy.gif)

But also because it has allowed for dedicated developers, whether at large corporations or part of the open source community, to build software that solves complex problems.

In the world of computer science, we care a lot about abstraction and layers. Cool APIs provide abstracted functionality to your web applications, making them robust and powerful. They can provide a lot of amazing functionality with relative ease. And, you can go around telling everyone your website incorporates ML, AI, etc!

## Overview

In this workshop, we're going to be building a web application that allows a user to speak into their microphone, then sends the audio file to the IBM Cloud to have the Watson Speech-To-Text engine return a string representing the words spoken, along with a confidence level for the accuracy of the prediction.

You could use something like this in everything from an online chatbot/customer service client, to an ordering platform!

## Setup

First you'll need to setup an account with IBM Cloud. This will get you a unique API key that you can use when sending speech-to-text requests.

To sign up, first go [here](some-link)...

somebody is filling this in

## Test API Key

Just to confirm that your API key has been activated, download the audio file linked [here](readme-content/audio-test.webm). `cd` into the directory you saved the file, then run the following curl command:

```bash
curl -X POST -u "apikey:<YOUR API KEY>" --header "Content-Type: audio/webm" --data-binary @audio-test.webm "https://stream.watsonplatform.net/speech-to-text/api/v1/recognize"
```

You should see a returned output from IBM Cloud similar to the following:

![curl test](readme-content/screenshots/curl-test.png)

Amazing! You just sent a request to IBM Cloud that processed an audio file and returned a transcript along with a confidence level. We can see here that Watson picked up "Hello World" and is 94% confident that those words are what was said.

If you got an error, especially something that says you only send a certain number of bytes, please flag one of us so we can help you!

Okay neat. Now that we know we can at least communicate with Watson, let's build a front-end! We don't want users to have to download an audio file, open their terminal, and run a curl command. That would be ridiculous.

Instead, let's build a tool that allows them to speak into their mic, and we handle all the rest. To get started, let's get setup.

## Clone Repo

First clone (or fork) the repository:

```bash
git clone https://github.com/dartmouth-cs52-19S/workshop-ws-04-30-cool-apis
```

Then change into the `app/` directory and install the necessary packages:

```bash
cd workshop-ws-04-03-cool-apis/app/
yarn
```

## Build Web App

Alright, let's think about what we are going to need for this web app. First, we definitely need to allow the user to speak into their microphone, and we need to hold onto that audio data. We're also going to want audio controls to start and stop the microphone. We also probably want an area for them to see the output from Watson.

Great, let's break these up into some components. Since our hierarchy is small, we don't need these to be connected components. Phew...

![phew](readme-content/gifs/phew.gif)

Okay, let's start with the microphone. On the surface, this seems kind of difficult. But, thanks to the open source community, someone has built a node package that provides a React component that acts as a microphone. It's called [react-mic](https://www.npmjs.com/package/react-mic), you should check it out!

Alright, let's add it to our project!

```bash
yarn add react-mic
```

Awesome. Now, let's add this to our project. Here's some of our component structure. Where do you think it goes?

```
├──[app]/                        # root directory
|  └──[src]                      # source files
|     └──[components]/           # contains basic components
|        └──[Recorder.js]        # handles microphone
|        └──[Output.js]          # displays IBM output
|     └──[index.js]/             # has App component
```

If you thought `Recorder.js`, you're right!

![thumbs-up](readme-content/gifs/thumbs-up.gif)

### Audio Recorder

Great, open up `Recorder.js` and you should see the basic architecture of a React component. You're probably getting some linting errors right now because we've set it up as a smart component, even thought it doesn't hold any state yet. Hold on friend, it's coming.

Before that though, let's add in `react-mic` and our styles:

```javascript
import { ReactMic } from 'react-mic';
import '../style.scss';
```

In the render function, let's return a `ReactMic` component:

```javascript
<div>
    <ReactMic
        record={this.state.record}
        className="sound-wave"
        onStop={this.onStop}
        strokeColor="#000000"
        backgroundColor="#FF4081"
    />
</div>
```

Wait... what does this do?

The `record` prop is a boolean indicating if the microphone should be recording or not. `className` should be familiar, that just allows us to target the component for styling. `onStop` is a function that is called when the microphone stops recording. `strokeColor` is the color of the sound wave, and `backgroundColor` is the color of the microphone area.

Once you paste that in, you'll probably be getting some linting errors, because our app has no state or methods. Let's fix that.  

In the constructor, add the following state:

```javascript
this.state = {
    record: false,
};
```

Then, let's add in the `onStop` method: 

```javascript
onStop = (recordedBlob) => {
    this.props.sendAudioBlob(recordedBlob.blob);
}
```

Woah props?? We haven't constructed the `App` component yet. How are we supposed to know what it's state will be? Good question, friend. Let's think about it. If `App` renders `Recorder` and `Output`, it should probably handle the request to Watson, right? So, `Recorder` gets the audio from the user and sends it to `App`. `App` sends that audio file to IBM Cloud who returns a transcript and confidence level back to `App`. `App` then passes that transcript to `Output` who displays it to the user. Simple, right?

Okay, then `this.props.sendAudioBlob` is a function passed through props that will take the audio file from `Recorder` and pass it along to IBM.

But what's a blob?? Blob objects are file-like objects that hold immutable, raw data. Files actually inherit from them. Dw if it doesn't make sense, we handled all the weird file stuff for you!

Okay great! Now that we have that, we need a way to turn on the microphone. Let's add some buttons **underneath** the `ReactMic` component:

```html
<button onClick={this.startRecording} type="button">Start</button>
<button onClick={this.stopRecording} type="button">Stop</button>
```

Then, let's add `this.startRecording` and `this.stopRecording`:

```javascript
startRecording = () => {
    this.setState({
      record: true,
    });
    this.props.microphoneStarted();
}

stopRecording = () => {
    this.setState({
        record: false,
    });
}
```

What's `this.props.microphoneStarted`? It's another function from `App` to tell `Output` that the microphone is recording. Neat!

### Send Request to Watson

Now that `App` has the audio data in the form of a blob, let's send it onto Watson. In order to do that, we need a Node/Express server. Whaaaaaat? We haven't learned that yet. Hey, u right. Because of this, we made one for you. Go back to the root, then change into the `server directory`. Then, install the project dependencies.

```bash
cd ../../server
yarn
```

Great. We'll leave it to Tim to explain how all of this works, but all you really need to know is that `src/server.js` is where our server lives. When we run this server from the command line (using `yarn start`) our app "listens" on port 9090 for incoming requests 

If you open up `src/server.js`, you'll this on line 25: 

```javascript
app.post('/', upload.single('file'), (req, res, next) => { ...
```

This sets up the base route of our server (i.e. `localhost:9090`) to be a POST request that takes in a file called `file`. In the actual function, you'll see a request being made to IBM Cloud. This basically takes the file in the form of a blob, saves it locally as a file, passes that file onto Watson, and waits for a response. Once it gets a response from Watson, it deletes the audio file on the server and sends the response to our front-end. How cool!


On line 36 where it says `<YOUR API KEY>`, you guessed it, paste in your API key from IBM.

Okay great, back to the frontend!

### Send Audio to Server

On the frontend, open up `index.js` and create the following function:

```javascript
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
```

What does this do? This makes a POST request to our server and passes along the audio blob. When the server responds, we save the output in our state.

!!! left off here !!!

next talk about saving that state and rendering the `Recorder`.









* Explanations of the what **and** the why behind each step. Try to include:
  * higher level concepts
  * best practices

Remember to explain any notation you are using.

```javascript
/* and use code blocks for any code! */
```

![screen shots are helpful](readme-content/screenshot.png)

:sunglasses: GitHub markdown files [support emoji notation](http://www.emoji-cheat-sheet.com/)

Here's a resource for [github markdown](https://guides.github.com/features/mastering-markdown/).


## Summary / What you Learned

* [ ] can be checkboxes

## Reflection

*2 questions for the workshop participants to answer (very short answer) when they submit the workshop. These should try to get at something core to the workshop, the what and the why.*

* [ ] 2 reflection questions
* [ ] 2 reflection questions


## Resources

* cite any resources
