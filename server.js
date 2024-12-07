/*WEB322 – Assignment 5 & 4 & 3 & 2
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name:                  Bahar Parsaeian
Student ID:            118314210
Date:                  2024-12-03
Render Web App URL:    https://web322-app-bohj.onrender.com/shop
GitHub Repository URL: https://github.com/Baharpa/web322-app
SSH:                   git@github.com:Baharpa/web322-app.git
********************************************************************************/
const multer = require("multer");             
const cloudinary = require("cloudinary").v2;  
const streamifier = require("streamifier");  
const { title } = require('process');

const express = require('express');
const path = require("path");
const exphbs = require('express-handlebars');
const storeService = require("./store-service")

cloudinary.config({
    cloud_name: "db92vv0cb",
    api_key: "523132737832711",
    api_secret: "LCrqnyMac4Z0Sbozx1kYImYo_TM",
    secure: true,
});

const upload = multer();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item">' +
                '<a href="' + url + '" class="nav-link' +
                ((url === app.locals.activeRoute) ? ' active' : '') +
                '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            return (lvalue !== rvalue) ? options.inverse(this) : options.fn(this);
        },
        formatDate: function(dateObj) {
            if (!dateObj) return 'N/A'; 
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/about', (req, res) => {
    res.render('about', {title: 'About'})
});

app.get('/shop', (req, res) => {
    const { id, category } = req.query;

    if (id) {
        storeService.getItemById(id)
            .then((item) => {
                if (item) {
                    res.render('shop', {
                        items: [item],
                        title: `Shop - Item ${id}`
                    });
                } else {
                    res.render('shop', {
                        items: [],
                        message: `No item found with ID: ${id}`,
                        title: 'Shop'
                    });
                }
            })
            .catch((err) => {
                console.error(`Error fetching item by ID ${id}:`, err);
                res.render('shop', {
                    items: [],
                    message: 'An error occurred while fetching the item.',
                    title: 'Shop'
                });
            });
    } else if (category) {
        storeService.getItemsByCategory(category)
            .then((items) => {
                storeService.getCategories()
                    .then((categories) => {
                        res.render('shop', { items, categories, title: 'Shop' });
                    })
                    .catch(() => {
                        res.render('shop', { items, message: "No categories found.", title: 'Shop' });
                    });
            })
            .catch(() => {
                storeService.getCategories()
                    .then((categories) => {
                        res.render('shop', { categories, message: "No items found.", title: 'Shop' });
                    })
                    .catch(() => {
                        res.render('shop', { message: "No items or categories found.", title: 'Shop' });
                    });
            });
    } else {
        storeService.getAllItems()
            .then((items) => {
                storeService.getCategories()
                    .then((categories) => {
                        res.render('shop', { items, categories, title: 'Shop' });
                    })
                    .catch(() => {
                        res.render('shop', { items, message: "No categories found.", title: 'Shop' });
                    });
            })
            .catch(() => {
                storeService.getCategories()
                    .then((categories) => {
                        res.render('shop', { categories, message: "No items found.", title: 'Shop' });
                    })
                    .catch(() => {
                        res.render('shop', { message: "No items or categories found.", title: 'Shop' });
                    });
            });
    }
});

app.get('/shop/:id', (req, res) => {
    const itemId = req.params.id;

    storeService.getItemById(itemId)
        .then((item) => {
            storeService.getCategories()
                .then((categories) => {
                    res.render('shop', { 
                        items: [item],
                        categories, 
                        title: `Shop - ${item.title}` 
                    });
                })
                .catch(() => {
                    res.render('shop', { 
                        items: [item], 
                        message: "No categories found.", 
                        title: `Shop - ${item.title}` 
                    });
                });
        })
        .catch(() => {
            storeService.getCategories()
                .then((categories) => {
                    res.render('shop', { 
                        categories, 
                        message: `Item with ID ${itemId} not found.`, 
                        title: 'Shop' 
                    });
                })
                .catch(() => {
                    res.render('shop', { 
                        message: "No items or categories found.", 
                        title: 'Shop' 
                    });
                });
        });
});

app.get('/items', (req, res) => {
    
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((items) => {
                if (items.length > 0) {
                    res.render('items', { items, title: 'Items' });
                } else {
                    res.render('items', { message: 'No results for the selected category', title: 'Items' });
                }
            })
            .catch((err) => {
                console.error('Error fetching items by category:', err);
                res.render('items', { message: 'Error fetching items by category', title: 'Items' });
            });
    }
    else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((items) => {
                if (items.length > 0) {
                    res.render('items', { items, title: 'Items' });
                } else {
                    res.render('items', { message: 'No results for the selected date range', title: 'Items' });
                }
            })
            .catch((err) => {
                console.error('Error fetching items by minDate:', err);
                res.render('items', { message: 'Error fetching items by minDate', title: 'Items' });
            });
    }
   
    else {
        storeService.getAllItems()
            .then((items) => {
                if (items.length > 0) {
                    res.render('items', { items, title: 'Items' });
                } else {
                    res.render('items', { message: 'No items available', title: 'Items' });
                }
            })
            .catch((err) => {
                console.error('Error fetching all items:', err);
                res.render('items', { message: 'Error fetching items', title: 'Items' });
            });
    }
});

app.get('/items/add', (req, res) => {
    storeService.getCategories()
        .then((categories) => {
            res.render('addPost', { categories, title: 'Add Post' });
        })
        .catch((err) => {
            console.error('Error fetching categories:', err);
            res.render('addPost', { categories: [], title: 'Add Post' });
        });
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
        }).catch((error) => {
            console.error("Image upload failed:", error);
            res.status(500).send("Error uploading image");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        storeService.addPost(req.body)
            .then(() => {
                res.redirect('/items'); 
            })
            .catch((err) => {
                console.error("Error adding item:", err);
                res.status(500).send("Error saving item");
            });            
    }
});

app.get('/items/:id', (req,res) => {
    storeService.getItemById(req.params.id)
        .then((item) => res.json(item))
        .catch((err) => res.status(500).json({ message: err}));
})

app.get('/items/delete/:id', (req, res) => {
    storeService.deletePostById(req.params.id)
        .then(() => res.redirect('/items'))
        .catch((err) => {
            console.error('Error deleting item:', err);
            res.status(500).send("Unable to Remove Post / Post not found");
        });
});

app.get('/api/item/:id', (req, res) => {
    const itemId = req.params.id;
    const item = storeService.fetchItemDetails(itemId);
  
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
});    

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then((categories) => {
            if (categories.length > 0) {
                res.render('categories', { categories, title: 'Categories' });
            } else {
                res.render('categories', { message: 'No categories found', title: 'Categories' });
            }
        })
        .catch((err) => {
            console.error('Error fetching categories:', err);
            res.render('categories', { message: 'Error fetching categories', title: 'Categories' });
        });
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory', { title: 'Add Category' });
});

app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch((err) => {
            console.error('Error adding category: ', err);
            res.status(500).send('Unable to add category');
        });
});

app.get('/categories/:id', (req, res) => {
    const categoryId = req.params.id;

    storeService.getItemsByCategory(categoryId)
        .then((items) => {
            res.render('items', { 
                items, 
                title: `Category ${categoryId}` 
            });
        })
        .catch(() => {
            res.render('items', { 
                message: "No items found for this category.", 
                title: `Category ${categoryId}` 
            });
        });
});

app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch((err) => {
            console.error('Error deleting category:', err);
            res.status(500).send('Unable to Remove Category / Category not found');
        });
});


app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Not Found'})
})

storeService.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error("Unable to start the server:", err);
    })
