const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/', (req, res, next) => {
  res.render('dashboard/index');
});

router.get('/archives', dashboardController.renderArchivesPage);

router.get('/article', dashboardController.renderArticlePage);
router.get('/article/:id', dashboardController.renderArticlePage);
router.post('/article', dashboardController.createArticle);
router.post('/article/update/:id', dashboardController.updateArticle);
router.delete('/article/:id', dashboardController.deleteArticle);

router.get('/categories', dashboardController.renderCategoriesPage);
router.post('/categories', dashboardController.createCategory);
router.post('/categories/delete/:id', dashboardController.deleteCategory);

module.exports = router;
