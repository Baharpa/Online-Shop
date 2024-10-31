
/*WEB322 – Assignment 02 & 3
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Bahar Parsaeian
Student ID: 118314210
Date: 2024-10-09
Render Web App URL:    https://web322-app-bohj.onrender.com
GitHub Repository URL: https://github.com/Baharpa/web322-app
SSH:                   git@github.com:Baharpa/web322-app.git
********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: 'db92vv0cb',       
  api_key: '523132737832711',    
  api_secret: 'LCrqnyMac4Z0Sbozx1kYImYo_TM', 
  secure: true
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err }));
});

app.get('/items', (req, res) => {
  if (req.query.category) {
    storeService.getItemsByCategory(req.query.category)
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: err }));
  } else if (req.query.minDate) {
    storeService.getItemsByMinDate(req.query.minDate)
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: err }));
  } else {
    storeService.getAllItems()
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: err }));
  }
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err }));
});

app.get('/items/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log("Uploaded image URL:", result.url);  // Logs the URL of uploaded image
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    }).catch((error) => {
      console.error("Cloudinary upload error:", error);
      res.status(500).send("Error uploading image");
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body)
      .then(() => res.redirect('/items'))
      .catch((err) => res.status(500).json({ message: err }));
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
});

storeService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(`Failed to initialize data: ${err}`);
  });