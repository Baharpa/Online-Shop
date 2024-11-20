const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');
const handlebars = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'db92vv0cb',
    api_key: '523132737832711',
    api_secret: 'LCrqnyMac4Z0Sbozx1kYImYo_TM',
    secure: true
});
const upload = multer();

const exphbs = handlebars.create({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return (
                '<li class="nav-item">' +
                '<a ' +
                (url == app.locals.activeRoute ? 'class="nav-link active" ' : 'class="nav-link" ') +
                'href="' + url + '">' +
                options.fn(this) +
                '</a></li>'
            );
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return new handlebars.handlebars.SafeString(context);
        }
    }
});

app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');
app.use(express.static('public'));

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

storeService.initialize()
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
                let items = req.query.category
                    ? await storeService.getPublishedItemsByCategory(req.query.category)
                    : await storeService.getPublishedItems();

                items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                viewData.items = items;
                viewData.item = items[0];
            } catch (err) {
                viewData.message = "no results";
            }

            try {
                viewData.categories = await storeService.getCategories();
            } catch (err) {
                viewData.categoriesMessage = "no results";
            }

            res.render("shop", { data: viewData });
        });

        app.get('/shop/:id', async (req, res) => {
            let viewData = {};

            try {
                let items = req.query.category
                    ? await storeService.getPublishedItemsByCategory(req.query.category)
                    : await storeService.getPublishedItems();

                items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                viewData.items = items;
            } catch (err) {
                viewData.message = "no results";
            }

            try {
                viewData.item = await storeService.getItemById(req.params.id);
            } catch (err) {
                viewData.message = "no results";
            }

            try {
                viewData.categories = await storeService.getCategories();
            } catch (err) {
                viewData.categoriesMessage = "no results";
            }

            res.render("shop", { data: viewData });
        });

        app.get('/items', (req, res) => {
            storeService.getAllItems()
                .then(items => res.render('items', { items }))
                .catch(err => res.render('items', { message: "no results" }));
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(categories => res.render('categories', { categories }))
                .catch(err => res.render('categories', { message: "no results" }));
        });

        app.get('/items/add', (req, res) => {
            res.render('addItem', { title: "Add Item" });
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
                    console.error("Cloudinary upload error:", err);
                    processItem("");
                });
            } else {
                processItem("");
            }

            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;
                req.body.published = req.body.published ? true : false;

                storeService.addItem(req.body)
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
