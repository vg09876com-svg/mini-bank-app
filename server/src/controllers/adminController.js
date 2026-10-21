const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const bcrypt = require('bcryptjs');

// GET ADMIN DASHBOARD STATISTICS
const getstats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        const totalLoans = await Loan.countDocuments();

        const users = await User.find({});
        const totalBalance = users.reduce(
            (total, user) => total + Number(user.balance || 0),
            0
        );

        return res.status(200).json({
            message: 'Admin statistics retrieved successfully',
            stats: {
                totalUsers,
                totalTransactions,
                totalLoans,
                totalBalance
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        return res.status(500).json({
            message: 'Unable to retrieve admin statistics'
        });
    }
};

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Users retrieved successfully',
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({
            message: 'Unable to retrieve users'
        });
    }
};

// CREATE A USER
const createUser = async (req, res) => {
    try {
        const { name, email, password, balance } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            return res.status(409).json({
                message: 'A user with this email already exists'
            });
        }

        let accountNumber;
        let accountExists = true;

        while (accountExists) {
            accountNumber = String(
                Math.floor(1000000000 + Math.random() * 9000000000)
            );

            accountExists = await User.exists({ accountNumber });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const startingBalance =
            balance === undefined ? 0 : Number(balance);

        if (!Number.isFinite(startingBalance) || startingBalance < 0) {
            return res.status(400).json({
                message: 'Balance must be a valid non-negative number'
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            accountNumber,
            balance: startingBalance,
            role: 'user'
        });

        const userObject = user.toObject();
        delete userObject.password;

        return res.status(201).json({
            message: 'User created successfully',
            user: userObject
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({
            message: 'Unable to create user'
        });
    }
};

// UPDATE A USER
const updateusers = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, balance, status } = req.body;

        const updates = {};

        if (name !== undefined) updates.name = name.trim();
        if (email !== undefined) updates.email = email.trim().toLowerCase();

        if (role !== undefined) {
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({
                    message: 'Role must be user or admin'
                });
            }
            updates.role = role;
        }

        if (balance !== undefined) {
            const newBalance = Number(balance);

            if (!Number.isFinite(newBalance) || newBalance < 0) {
                return res.status(400).json({
                    message: 'Balance must be a valid non-negative number'
                });
            }

            updates.balance = newBalance;
        }

        if (status !== undefined) {
            if (!['active', 'banned'].includes(status)) {
                return res.status(400).json({
                    message: 'Status must be active or banned'
                });
            }
            updates.status = status;
        }

        const user = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({
            message: 'Unable to update user'
        });
    }
};

// BAN OR UNBAN A USER
const banuser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (String(user._id) === String(req.user._id)) {
            return res.status(400).json({
                message: 'You cannot ban your own account'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                message: 'An admin account cannot be banned here'
            });
        }

        user.status = user.status === 'banned' ? 'active' : 'banned';
        await user.save();

        return res.status(200).json({
            message: `User account ${user.status}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Ban user error:', error);
        return res.status(500).json({
            message: 'Unable to change user status'
        });
    }
};

// GET ALL LOANS
const getloan = async (req, res) => {
    try {
        const loans = await Loan.find({}).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Loans retrieved successfully',
            count: loans.length,
            loans
        });
    } catch (error) {
        console.error('Get loans error:', error);
        return res.status(500).json({
            message: 'Unable to retrieve loans'
        });
    }
};

// UPDATE A LOAN'S STATUS
const updateloans = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            'pending',
            'approved',
            'rejected',
            'paid'
        ];

        if (!status || !allowedStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: 'Provide a valid loan status: pending, approved, rejected, or paid'
            });
        }

        const loan = await Loan.findByIdAndUpdate(
            id,
            { status: status.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!loan) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        return res.status(200).json({
            message: 'Loan status updated successfully',
            loan
        });
    } catch (error) {
        console.error('Update loan error:', error);
        return res.status(500).json({
            message: 'Unable to update loan status'
        });
    }
};

// GET ALL TRANSACTIONS
const admintrans = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Transactions retrieved successfully',
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        return res.status(500).json({
            message: 'Unable to retrieve transactions'
        });
    }
};

module.exports = {
    getstats,
    getUsers,
    getusers: getUsers,
    getuser: getUsers,
    createUser,
    createusers: createUser,
    updateusers,
    banuser,
    getloan,
    getloans: getloan,
    loans: getloan,
    updateloans,
    admintrans
};
