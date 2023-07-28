import './App.css';
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import Chatbox from './Chatbox.js';
import { w3cwebsocket as WebSocketClient } from 'websocket';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  
  const [spaceName, setSpaceName] = useState("")
  const [messages, setMessages] = useState([])
  const [websocketClient, setWebsocketClient] = useState(null);
  const [spaceSelected, setSpaceSelected] = useState(false);

  const handleInputChange = (event) => {
    setSpaceName(event.target.value);
  };

  useEffect(() => {
    console.log("made it to space selection")
    console.log(spaceSelected)
    if (spaceSelected) {
      console.log("opening web socket")
      const client = new WebSocketClient('ws://localhost:5000'); // Replace with your backend WebSocket server URL
      client.onopen = () => {
        console.log('WebSocket Client Connected');
        setWebsocketClient(client);
        var message = document.getElementsByName("prompt")[0].value
        client.send(message);
        document.getElementsByName("prompt")[0].value = ""
      };

      client.onmessage = (message) => {
        console.log(message.data)
        setMessages(messages=>[...messages, {text:message.data, bot:false}]);
      };

      client.onclose = () => {
        console.log('WebSocket Client Disconnected');
        setWebsocketClient(null);
      };

      return () => {
        if (client) {
          client.close();
        }
      };
      
    }
  }, [spaceSelected]);
 
  const sendToSocket = () => {
    var message = document.getElementsByName("prompt")[0].value
    setMessages(messages=>[...messages, {text:spaceName, bot:false}])
    if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
      websocketClient.send(message);
    }
    document.getElementsByName("prompt")[0].value = ""
  };

  var getDocuments = async () => {
    console.log("documents")
    setMessages(messages=>[...messages, {text:spaceName, bot:false}])

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

    setSpaceSelected(true)
  }

  console.log(messages)

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
                  if (spaceSelected) {
                    sendToSocket()
                  }
                  else {
                    getDocuments()
                  }
                  document.getElementsByName("prompt")[0].value = ""
                }}}
                />
              
              <Button onClick={spaceSelected ? sendToSocket : getDocuments} className="send-button" type="button"> Send </Button>
            </div>
          </div>

      
    </div>
  </Container>
  );
}

export default App;