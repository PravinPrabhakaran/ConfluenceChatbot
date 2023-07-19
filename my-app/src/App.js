import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

function App() {
  
  const [content, setContent] = useState([])
  const [spaceName, setSpaceName] = useState("")

  const handleInputChange = (event) => {
    setSpaceName(event.target.value);
  };

  var getDocuments = async () => {
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

  }
  


  return (
    <div className="App">
          {content.map((item) => (
            <body>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </body>
          ))}

      <Form.Control
          type="text"
          placeholder="Enter space name"
          value={spaceName}
          onChange={handleInputChange}
        />
      <Button onClick={getDocuments} variant="primary" type="button">Get Documents</Button>
    </div>
  );
}

export default App;
