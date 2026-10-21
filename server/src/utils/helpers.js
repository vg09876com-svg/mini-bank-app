const User = require('../models/User');

const generateUniqueAccountNumber = async () => {
    let accountNumber;
    let existingUser;

    do {
        accountNumber = String(
            Math.floor(1000000000 + Math.random() * 9000000000)
        );

        existingUser = await User.findOne({ accountNumber });
    } while (existingUser);

    return accountNumber;
};

module.exports = { generateUniqueAccountNumber };