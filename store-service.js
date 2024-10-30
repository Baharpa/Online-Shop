const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
      if (err) reject('Unable to read file: items.json');
      else {
        items = JSON.parse(data);
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
          if (err) reject('Unable to read file: categories.json');
          else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
}

function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length > 0) resolve(items);
    else reject('No results returned');
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published === true);
    if (publishedItems.length > 0) resolve(publishedItems);
    else reject('No results returned');
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) resolve(categories);
    else reject('No results returned');
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;
    itemData.id = items.length + 1;
    items.push(itemData);
    resolve(itemData);
  });
}

function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category === parseInt(category));
    if (filteredItems.length > 0) resolve(filteredItems);
    else reject("No results returned");
  });
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
    if (filteredItems.length > 0) resolve(filteredItems);
    else reject("No results returned");
  });
}

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate
};
