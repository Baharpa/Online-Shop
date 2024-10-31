
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: 'db92vv0cb',       // replace with your actual Cloud Name
  api_key: '523132737832711',    // replace with your actual API Key
  api_secret: 'LCrqnyMac4Z0Sbozx1kYImYo_TM',  // replace with your actual API Secret
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