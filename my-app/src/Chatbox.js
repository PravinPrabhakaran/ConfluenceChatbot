import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

function Chatbox(props) {

    const borderRadiusStyle = props.bot ? { borderTopLeftRadius: '0'} : { borderTopRightRadius: '0' };
    const alignSelfStyle = props.bot ? { alignSelf: 'start' } : { alignSelf: 'end' };

  return (
    <Card className="chat-box rounded-lg shadow-l" style={{...borderRadiusStyle, ...alignSelfStyle}}>
        <Card.Body>
        <div className="message">
            <p>Hello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?ello, how can I help you?asdasdaasdjasidjsaidjisajidiasdijajid saidjisajidiasdijajid saidjisajidiasdijajid saidjisajidiasdijajid saidjisajidiasdijajid saidjisajidiasdijajid</p>
        </div>
        </Card.Body>
    </Card>
  )
}



export default Chatbox;