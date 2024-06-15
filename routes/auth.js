const express = require('express');
const router = express.Router();

const { client: firebaseClient } = require('../connections/firebase.js');
const { signInWithEmailAndPassword } = require('firebase/auth');

router.get('/login', (req, res, next) => {
  const message = req.flash('message');
  const messageStatus = req.flash('messageStatus');

  res.render('dashboard/login', {
    hasMessage: message.length > 0,
    message,
    messageStatus,
  });
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await signInWithEmailAndPassword(firebaseClient, email, password);
    req.session.uid = user.user.uid;
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('message', '帳號或密碼錯誤');
    req.flash('messageStatus', 'warning');
    return res.redirect('/auth/login');
  }
});

module.exports = router;
