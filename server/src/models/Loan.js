
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String
    },
    userEmail: {
        type: String
    },
    accountNumber: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    durationMonths: {
        type: Number,
        default: 6
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports =
    mongoose.models.Loan ||
    mongoose.model('Loan', loanSchema);
