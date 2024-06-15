const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

router.get('/', indexController.renderIndexPage);
router.get('/post/:id', indexController.renderPostPage);

module.exports = router;
