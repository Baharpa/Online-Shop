/*WEB322 – Assignment 02
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
