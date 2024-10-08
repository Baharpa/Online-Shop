const fs = require('fs');

let items = [];
let categories = [];

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};

//
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject("No items found");
        } else {
            resolve(items);
        }
    });
}


function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject("No published items found");
        } else {
            resolve(publishedItems);
        }
    });
}


function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No categories found");
        } else {
            resolve(categories);
        }
    });
}


function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}
