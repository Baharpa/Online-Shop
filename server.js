const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json({ message: err });
    });
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json({ message: err });
    });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json({ message: err });
    });
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
