const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
