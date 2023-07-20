import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import Chatbox from './Chatbox.js'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  
  const [content, setContent] = useState([])
  const [spaceName, setSpaceName] = useState("")
  const [spaceSelected, setSpaceSelected] = useState(false)

  const handleInputChange = (event) => {
    setSpaceName(event.target.value);
  };

  var getDocuments = async () => {

    if (spaceSelected) {
      const response = await fetch('/api/send-to-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaceName }),
      });

    }
    else {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaceName }),
        });
      
        console.log(response)

        if (!response.ok) {
          console.log(response)
          console.error('Error sending message');
        }
  
        const data = await response.json();
        setContent(content => data);
      }
  
      catch (error) {
        console.log("hello2")
        console.error(error)
      }

      setSpaceSelected(true)
    }
  }


  


  return (
    <Container>
    
    <div className="App">
        <h1>Confluence Chatbot</h1>

          <div className="messageContainer">      
            <Container className="d-flex flex-column">
              <Chatbox />
              <Chatbox />
              <Chatbox />

              <br />
            </Container>

          </div>

          <div className="messageInput">
            <div className="input-container mt-3 d-flex">
              <Form.Control type="text" className="message-input flex-grow-1"
              
                placeholder="Enter space name"
                value={spaceName}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                  e.preventDefault();
                  getDocuments()
                  document.getElementsByName("prompt")[0].value = ""
                }}}
                />
              
              <Button onClick={getDocuments} className="send-button" type="button"> Send </Button>
            </div>
          </div>

      
    </div>
  </Container>
  );
}

export default App;

/** 
{content.map((item) => (
  <body>
    <h3>{item.title}</h3>
    <p>{item.body}</p>
  </body>

*/