 const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');

const {
    registeruser,
    login,
    getme,
    lookup,
    getdashboard,
    transfer,
    transactions,
    withdraw,
    deposit
} = require('../controllers/authController');

const {
    getstats,
    getUsers,
    createUser,
    updateusers,
    banuser,
    getloan,
    updateloans,
    admintrans
} = require('../controllers/adminController');

// ============================
// AUTH ROUTES
// ============================

router.post('/register', registeruser);
router.post('/login', login);
router.get('/me', protect, getme);
router.get('/lookup/:accountNumber', protect, lookup);

// ============================
// USER ROUTES
// ============================

router.get('/user/dashboard', protect, getdashboard);
router.get('/user/transactions', protect, transactions);
router.post('/user/transfer', protect, transfer);
router.post('/user/withdraw', protect, withdraw);
router.post('/user/deposit', protect, deposit);

// ============================
// ADMIN ROUTES
// ============================

router.get('/admin/stats', protect, adminOnly, getstats);
router.get('/admin/users', protect, adminOnly, getUsers);
router.post('/admin/users', protect, adminOnly, createUser);
router.put('/admin/users/:id', protect, adminOnly, updateusers);
router.put('/admin/users/:id/ban', protect, adminOnly, banuser);
router.get('/admin/transactions', protect, adminOnly, admintrans);

// ============================
// LOAN ROUTES
// ============================

router.get('/admin/loans', protect, adminOnly, getloan);
router.put('/admin/loans/:id/status', protect, adminOnly, updateloans);

module.exports = router;
