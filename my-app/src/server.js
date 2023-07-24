//Imports express.js
const express = require('express')
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdfSaver = require('pdfkit')
const { spawn } = require('child_process');
const doc = require('pdfkit');
const dotenv = require('dotenv').config({ path: './keys.env' });
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');


//Makes an instance of the express application
const app = express();

//Parses incoming JSON 
app.use(express.json());
app.use(cors())


let lastPythonResponse = "";
let doc_paths = [];
let pythonProcess;
let spaceSelected = "";
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

//(Python process, Web sockets)
const activeWebSockets = new Map(); //Map to store websocket connections

// Function to remove HTML tags from content
const removeHtmlTags = (content) => {
  // Remove HTML tags
  const withoutTags = content.replace(/<[^>]+>/g, '');

  // Remove &nbsp; occurrences
  const withoutNbsp = withoutTags.replace(/&nbsp;/g, ' ');

  return withoutNbsp;
  };

// Function to make API calls using axios
const fetchData = async (url, auth) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Basic ${auth}`, // This is the Base64 encoded auth string
    };
  
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

const savePDF = (page) => {
    const {title, body} = page;


    if (!fs.existsSync(`${__dirname}/pdfs/`)) {
      fs.mkdirSync(`${__dirname}/pdfs/`);
    }

    const pdfPath = `${__dirname}/pdfs/${title}.pdf`;
    doc_paths.push(pdfPath)
    if (fs.existsSync(pdfPath)) {
      return;
    }
    
    const doc = new pdfSaver();
    
    const stream = fs.createWriteStream(pdfPath)

    doc.text(title);
    doc.moveDown();
    doc.text(body);

    doc.pipe(stream)
    doc.end()

    stream.on('finish', () => {
      console.log(`PDF Saved : ${title}.pdf`)
    })

  }

app.post('/api/documents', async (req, res) => {
    const { spaceName } = req.body;

    //Make sure inside this if to kill the Python process (WIll be used for switching Space option)
    if (spaceSelected != "" && spaceSelected == spaceName) {
      console.log("Call is trying to reselect or select a Confluence space that is currently selected")
      return;
    } 

    try {
        const spaceAuth = Buffer.from(`${process.env.confluence_email}:${process.env.confluence_API_KEY}`).toString('base64');
        // First API call to get the ID of a Space
        const spaceIDCall = `https://comparethemarket.atlassian.net/wiki/rest/api/space/${spaceName}`
        const spaceIDData = await fetchData(spaceIDCall, spaceAuth);
        
        // Second API call to get the pages in a Confluence space
        const spaceUrl = `https://comparethemarket.atlassian.net/wiki/api/v2/spaces/${spaceIDData.id}/pages`;
        const pageIDData = await fetchData(spaceUrl, spaceAuth);

        const pageResults = pageIDData.results;
    
        // Loop through each page ID and make subsequent API calls to get the content
        const contentUrlBase = 'https://comparethemarket.atlassian.net/wiki/api/v2/pages/';
        const contentPromises = pageResults.map(async (page) => {
          const contentUrl = `${contentUrlBase}${page.id}?body-format=storage`;
          const contentData = await fetchData(contentUrl, spaceAuth);
          return contentData;
        });

        // Wait for all promises to resolve and collect the content data
        const contentResults = await Promise.all(contentPromises);
        const formattedContent = contentResults.map((contentData) => {
          return {
            title: contentData.title,
            body: removeHtmlTags(contentData.body.storage.value), // Assuming 'body.storage.value' contains the content
          };
        });

        formattedContent.map(savePDF)
      } catch (error) {
        console.error('Error fetching documents:', error.message);
        res.status(500).json({ error: 'Failed to fetch documents' });
      }
      
      console.log("Successfully loaded documents")


});


wss.on('connection', (client) => {
  console.log("connection message")
  client.on('message', (message) => {
    console.log("message received")
    for (const [pythonProcess, connectedSocket] of activeWebSockets) {
      if (client == connectedSocket) {
        sendInput(message, pythonProcess)
        return
      }
    }

    sendInput(message, start_python(client))

    console.log(`Received message and sent to python: ${message}`);
    
  });

  client.on('close', () => {
    console.log('WebSocket Client Disconnected');
    // Remove the WebSocket connection from activeConnections when it's disconnected
    for (const [pythonProcess, connectedSocket] of activeWebSockets) {
      if (client == connectedSocket) {
        pythonProcess.kill()
        console.log("Deleted child process")
        return
      }
    }

    console.log("Didn't delete python child process properly")

  });
})

wss.on('listening', () => {
  console.log('WebSocket Server is listening on port 5000');
});


const start_python = (websocketClient) => {

  const documentPaths = doc_paths
  const apiKey = process.env.GPT_API_KEY
  console.log(doc_paths)

  pythonProcess = spawn('python', ['./run.py',apiKey, ...documentPaths]);

  // Handle Python process termination or crash
  pythonProcess.on('close', (code) => {
      console.error(`Python script exited with code ${code}`);
      activeWebSockets.delete(pythonProcess)
  });


  // Handle Python process termination or crash
  pythonProcess.on('close', (code) => {
    console.error(`Python script exited with code ${code}`);
    activeWebSockets.delete(pythonProcess)
  });

  // Handle Python process output - Sends received data through Websocket
  pythonProcess.stdout.on('data', (data) => {
    if (activeWebSockets.has(pythonProcess)) {
      const client = activeWebSockets.get(pythonProcess);
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString())
      }
      else {
        console.log("Socket is closing or closed, removing this socket and python process")
        activeWebSockets.delete(pythonProcess)
        pythonProcess.kill()
      }
    }
    else {
      console.log("Could not find a web socket for this python process")
      pythonProcess.kill()
    }

  });

  // Handle Python process errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(data.toString()); // Output the error message
  });

  activeWebSockets.set(pythonProcess, websocketClient)
  return pythonProcess
}

const sendInput = (message, pythonProcess) => {
  pythonProcess.stdin.write(message + '\n');
}

const port = 5000;
server.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})