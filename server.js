const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});

app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

const port = process.env.PORT || 8080;
storeService.initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.log("Failed to initialize data:", err);
    });
