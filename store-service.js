const Sequelize = require('sequelize');

const sequelize = new Sequelize("shop", "shop_owner", "HI52KYJemuwS", {
    host: "ep-green-lab-a53ohy4h.us-east-2.aws.neon.tech",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, 
        },
    },
    query: { raw: true },
});

const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });

const initialize = () => {
  return new Promise((resolve, reject) => {
      sequelize.sync()
          .then(() => resolve('Database synced successfully!'))
          .catch(err => reject('Unable to sync the database: ' + err));
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
      Item.findAll()
          .then(data => resolve(data))
          .catch(err => reject('No items returned: ' + err));
  });
};

const getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      Item.findAll({ where: { category } })
          .then(data => resolve(data))
          .catch(err => reject('No results returned: ' + err));
  });
};

const getItemsByMinDate = (minDateStr) => {
  const { gte } = Sequelize.Op;
  return new Promise((resolve, reject) => {
      Item.findAll({
          where: {
              postDate: {
                  [gte]: new Date(minDateStr)
              }
          }
      })
          .then(data => resolve(data))
          .catch(err => reject('No results returned: ' + err));
  });
};

const getItemById = (id) => {
  return new Promise((resolve, reject) => {
      Item.findByPk(id)
          .then(data => {
              if (data) resolve(data);
              else reject('No results returned');
          })
          .catch(err => reject('No results returned: ' + err));
  });
};

const addPost = (itemData) => {
  return new Promise((resolve, reject) => {
      itemData.published = itemData.published ? true : false;

      for (const key in itemData) {
          if (itemData[key] === '') {
              itemData[key] = null;
          }
      }

      itemData.postDate = new Date();

      Item.create(itemData)
          .then(data => resolve(data))
          .catch(err => reject('Unable to create post: ' + err));
  });
};

const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
      Item.findAll({ where: { published: true } })
          .then(data => resolve(data))
          .catch(err => reject('No results returned: ' + err));
  });
};

const getPublishedItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      Item.findAll({ where: { published: true, category } })
          .then(data => resolve(data))
          .catch(err => reject('No results returned: ' + err));
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
      Category.findAll()
          .then(data => resolve(data))
          .catch(err => reject('No categories returned: ' + err));
  });
};

const addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
      for (const key in categoryData) {
          if (categoryData[key] === '') {
              categoryData[key] = null;
          }
      }
      Category.create(categoryData)
          .then(data => resolve(data))
          .catch(err => reject('Unable to create category: ' + err));
  });
};

const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
      Category.destroy({where : { id } })
          .then((deleted) => {
              if (deleted) resolve();
              else reject('Category not found!');
          })
          .catch(err => reject('Unable to remove category: ' + err));
  });
};

const deletePostById = (id) => {
  return new Promise((resolve, reject) => {
      Item.destroy({where : { id } })
          .then((deleted) => {
              if (deleted) resolve();
              else reject('Post not found!');
          })
          .catch(err => reject('Unable to remove post: ' + err));
  });
};

module.exports = {
  initialize,
  getAllItems,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById,
  addPost,
  getPublishedItems,
  getPublishedItemsByCategory,
  getCategories,
  addCategory,
  deleteCategoryById,
  deletePostById
};
