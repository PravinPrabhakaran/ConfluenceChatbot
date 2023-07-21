import './App.css';
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import Chatbox from './Chatbox.js'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  
  const [spaceName, setSpaceName] = useState("")
  const [spaceSelected, setSpaceSelected] = useState(false)
  const [messages, setMessages] = useState([])

  const handleInputChange = (event) => {
    setSpaceName(event.target.value);
  };

  var getDocuments = async () => {

    setMessages(messages=>[...messages, {text:spaceName, bot:false}])

    if (spaceSelected) {
      console.log("Sending to python the question (send-to-python)")
      const response = await fetch('/api/send-to-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaceName }),
      });

    }
    else {
      console.log("Sending the spacename to collect docs (documents)")
      setSpaceSelected(spaceSelected=>true)
      console.log(spaceSelected)
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaceName }),
        });

        const data = await response.json();
      
        if (!response.ok) {
          console.error('Error sending message');
        }

      }
  
      catch (error) {
        console.log("hello2")
        console.error(error)
      }
    }
  }


  


  return (
    <Container>
    
    <div className="App">
        <h1>Confluence Chatbot</h1>

          <div className="messageContainer">      
            <Container className="d-flex flex-column">
              <Chatbox bot={true} text={"Enter the name of a Confluence Space"}/>
              
              {
                messages.map((messagePair) => (
                  <Chatbox bot={messagePair.bot} text={messagePair.text} />
                ))
              }

              <br />
            </Container>

          </div>

          <div className="messageInput">
            <div className="input-container mt-3 d-flex">
              <Form.Control type="text" className="message-input flex-grow-1"
                name="prompt"
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