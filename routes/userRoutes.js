const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
  updateMe,
} = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//в данном случае, т.к router является по сути мини приложением мы можем использовать authController.protect и защитить таким образом все пути, которые находятся ниже. Т.е. authController.protect будет относиться ко всему и мы можем не использовать это в каждом отдельном
router.use(authController.protect);
router.patch(
  '/updateMyPassword',

  authController.updatePassword
);
router.get(
  '/me',

  userController.getMe,
  userController.getUser
);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//точно также как и protect выше используем данный middleware для того чтобы использовать автоматом restrictTo для всех функций, которые расположены ниже.
router.use(authController.restrictTo('admin'))

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
