import React from 'react';
import '../style.scss';

const Output = (props) => {
  if (props.audioState) {
    return <p>{props.audioState}</p>;
  } else {
    return (
      <div>
        <h1>{props.text}</h1>
        <h1>{props.confidenceLevel}</h1>
      </div>
    );
  }
};

export default Output;
