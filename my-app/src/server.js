//Imports express.js
const express = require('express')
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdfSaver = require('pdfkit')

//Makes an instance of the express application
const app = express();

//Parses incoming JSON 
app.use(express.json());

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

    try {

        const spaceAuth = Buffer.from('Pravin.Prabhakaran@comparethemarket.com:ATATT3xFfGF0g46tSBJGzhPh_MzoAUr8C9kGEL3OcW3QOuJCvrco3_Es87AqAede9TZPvViOVvebGdpwFszSGVPTGjzcU3qKwrRd1pd2ewOdNUzCQTk_tWnI_frvnZ8v-lPjDUFhSgkyNyZejXFQ301KTFoekUDx2urqmlTDyTRBzdFl0cjnglw=E41A82E1').toString('base64');

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
        console.log(contentResults)
        const formattedContent = contentResults.map((contentData) => {
          return {
            title: contentData.title,
            body: removeHtmlTags(contentData.body.storage.value), // Assuming 'body.storage.value' contains the content
          };
        });

        formattedContent.map(savePDF)
        res.json(formattedContent);
      } catch (error) {
        console.error('Error fetching documents:', error.message);
        res.status(500).json({ error: 'Failed to fetch documents' });
      }
});


const port = 5000;
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})
