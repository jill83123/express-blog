const { admin: firebaseAdmin } = require('../connections/firebase.js');
const firebaseDB = firebaseAdmin.database();

const articlesRef = firebaseDB.ref('articles');
const categoriesRef = firebaseDB.ref('categories');

const moment = require('moment');
const striptags = require('striptags');

const convertPagination = require('../utils/convertPagination');

const indexController = {
  async renderIndexPage(req, res, next) {
    const categoriesSnapshot = await categoriesRef.once('value');
    const categories = categoriesSnapshot.val();

    const articlesSnapshot = await articlesRef.orderByChild('createTime').once('value');
    const articles =
      Object.values(articlesSnapshot.val())
        .reverse()
        .filter((article) => article.status === 'public') || [];

    const { sortedData, pagination } = convertPagination({
      data: articles,
      currentPage: req.query.page,
    });

    const currentUrl = `${req.path}?`;

    res.render('index', {
      articles: sortedData,
      categories,
      moment,
      striptags,
      pagination,
      currentUrl,
    });
  },

  async renderPostPage(req, res, next) {
    const { id } = req.params;

    const articleSnapshot = await articlesRef.child(id || ' ').once('value');
    const categoriesSnapshot = await categoriesRef.once('value');

    if (!articleSnapshot.val()) {
      res.render('error', { title: '找不到文章！' });
      return;
    }

    res.render('post', {
      article: articleSnapshot.val() || {},
      categories: categoriesSnapshot.val(),
      moment,
      striptags,
    });
  },
};

module.exports = indexController;
