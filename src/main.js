import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import './style/main.styl';

const Greeting = (props, context) =>
  <div style={{color: props.color}}> Hello, {props.name}!</div>

ReactDOM.render(<Greeting name="Ed" color="red" />, document.body)
