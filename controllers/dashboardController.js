const { admin: firebaseAdmin } = require('../connections/firebase.js');
const firebaseDB = firebaseAdmin.database();

const moment = require('moment');
const striptags = require('striptags');

const articlesRef = firebaseDB.ref('articles');
const categoriesRef = firebaseDB.ref('categories');

const convertPagination = require('../utils/convertPagination');

const dashboardController = {
  async renderCategoriesPage(req, res, next) {
    const categoriesSnapshot = await categoriesRef.once('value');

    const message = req.flash('message');
    const messageStatus = req.flash('messageStatus');

    res.render('dashboard/categories', {
      categories: categoriesSnapshot.val(),
      hasMessage: message.length > 0,
      message,
      messageStatus,
    });
  },

  async createCategory(req, res, next) {
    const { name, path } = req.body;

    const categoryRef = categoriesRef.push();
    const categoryId = categoryRef.key;

    // 搜尋特定欄位
    const existingPath = await categoriesRef.orderByChild('path').equalTo(path).once('value');
    const existingName = await categoriesRef.orderByChild('name').equalTo(name).once('value');
    if (existingPath.val() || existingName.val()) {
      req.flash('message', '已有相同的 分類名稱 或 路徑');
      req.flash('messageStatus', 'warning');
      res.redirect('/dashboard/categories');
      return;
    }

    const categoryData = {
      id: categoryId,
      name,
      path,
    };

    await categoryRef.set(categoryData);
    req.flash('message', '新增成功');
    req.flash('messageStatus', 'success');
    res.redirect('/dashboard/categories');
  },

  async deleteCategory(req, res, next) {
    const { id } = req.params;
    await categoriesRef.child(id).remove();
    req.flash('message', '分類已刪除');
    req.flash('messageStatus', 'success');
    res.redirect('/dashboard/categories');
  },

  async renderArticlePage(req, res, next) {
    const { id } = req.params;

    const articleSnapshot = await articlesRef.child(id || ' ').once('value');
    const categoriesSnapshot = await categoriesRef.once('value');

    if (req.params.id && !articleSnapshot.val()) {
      res.render('error', { title: '找不到文章！' });
      return;
    }

    const message = req.flash('message');
    const messageStatus = req.flash('messageStatus');

    res.render('dashboard/article', {
      article: articleSnapshot.val() || {},
      categories: categoriesSnapshot.val(),
      hasMessage: message.length > 0,
      message,
      messageStatus,
    });
  },

  async createArticle(req, res, next) {
    const { title, content, category, status } = req.body;

    const articleRef = articlesRef.push();
    const articleId = articleRef.key;

    const articleData = {
      id: articleId,
      title,
      content,
      category,
      status,
      createTime: Date.now(),
    };

    await articleRef.set(articleData);
    req.flash('message', '新增成功');
    req.flash('messageStatus', 'success');
    res.redirect(`/dashboard/article/${articleId}`);
  },

  async updateArticle(req, res, next) {
    const { id } = req.params;
    const { title, content, category, status } = req.body;

    const articleData = {
      title,
      content,
      category,
      status,
      updateTime: Date.now(),
    };

    await articlesRef.child(id).update(articleData);
    req.flash('message', '更新成功');
    req.flash('messageStatus', 'success');
    res.redirect(`/dashboard/article/${id}`);
  },

  async renderArchivesPage(req, res, next) {
    const status = req.query.status || 'public';

    const categoriesSnapshot = await categoriesRef.once('value');
    const categories = categoriesSnapshot.val();

    const articlesSnapshot = await articlesRef.orderByChild('createTime').once('value');
    const articles = Object.values(articlesSnapshot.val())
      .reverse()
      .filter((article) => article.status === status);

    const { sortedData, pagination } = convertPagination({
      data: articles,
      currentPage: req.query.page,
    });

    const currentUrl = `${req.baseUrl}${req.path}?status=${status}&`;

    res.render('dashboard/archives', {
      articles: sortedData,
      categories,
      moment,
      striptags,
      status,
      pagination,
      currentUrl,
    });
  },

  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;
      await articlesRef.child(id).remove();
      res.send({ success: true, message: '刪除成功' });
    } catch (err) {
      res.status(500).send({ success: false, message: '刪除失敗' });
    }
  },
};

module.exports = dashboardController;
