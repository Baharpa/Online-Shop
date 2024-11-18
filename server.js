const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const itemData = require('./store-service');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'YOUR_CLOUD_NAME',
    api_key: 'YOUR_API_KEY',
    api_secret: 'YOUR_API_SECRET',
    secure: true
});

const upload = multer();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

itemData.initialize()
    .then(() => {
        app.get('/', (req, res) => {
            res.redirect('/shop');
        });

        app.get('/about', (req, res) => {
            res.render('about', { title: "About" });
        });

        app.get('/shop', async (req, res) => {
            let viewData = {};
            try {
                let items = [];
                if (req.query.category) {
                    items = await itemData.getPublishedItemsByCategory(req.query.category);
                } else {
                    items = await itemData.getPublishedItems();
                }
                items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                let item = items[0];
                viewData.items = items;
                viewData.item = item;
            } catch (err) {
                viewData.message = "no results";
            }
            try {
                let categories = await itemData.getCategories();
                viewData.categories = categories;
            } catch (err) {
                viewData.categoriesMessage = "no results";
            }
            res.render("shop", { data: viewData });
        });

        app.get('/shop/:id', async (req, res) => {
            let viewData = {};
            try {
                let items = [];
                if (req.query.category) {
                    items = await itemData.getPublishedItemsByCategory(req.query.category);
                } else {
                    items = await itemData.getPublishedItems();
                }
                items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                viewData.items = items;
            } catch (err) {
                viewData.message = "no results";
            }
            try {
                viewData.item = await itemData.getItemById(parseInt(req.params.id));
            } catch (err) {
                viewData.message = "no results";
            }
            try {
                let categories = await itemData.getCategories();
                viewData.categories = categories;
            } catch (err) {
                viewData.categoriesMessage = "no results";
            }
            res.render("shop", { data: viewData });
        });

        app.get('/items', (req, res) => {
            itemData.getAllItems()
                .then(items => res.render('items', { items }))
                .catch(err => res.render('items', { message: "no results" }));
        });

        app.get('/categories', (req, res) => {
            itemData.getCategories()
                .then(categories => res.render('categories', { categories }))
                .catch(err => res.render('categories', { message: "no results" }));
        });

        app.get('/items/add', async (req, res) => {
            try {
                const categories = await itemData.getCategories();
                res.render('addItem', { categories });
            } catch (err) {
                res.render('addItem', { categories: [] });
            }
        });

        app.post('/items/add', upload.single("featureImage"), (req, res) => {
            if (req.file) {
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };

                async function upload(req) {
                    let result = await streamUpload(req);
                    return result;
                }

                upload(req).then((uploaded) => {
                    processItem(uploaded.url);
                }).catch(err => {
                    processItem("");
                });
            } else {
                processItem("");
            }

            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;
                req.body.published = req.body.published ? true : false;
                req.body.postDate = new Date().toISOString().split('T')[0];
                itemData.addItem(req.body)
                    .then(() => res.redirect('/items'))
                    .catch(err => res.status(500).send("Error adding item: " + err));
            }
        });

        app.use((req, res) => {
            res.status(404).render('404', { title: "Page Not Found" });
        });

        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });

    })
    .catch(err => {
        console.error("Failed to initialize store-service: ", err);
    });
