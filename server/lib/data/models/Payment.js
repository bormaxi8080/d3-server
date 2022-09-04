exports.get = function(dbBasis) {
    return dbBasis.define('payment', {
        user_id:        { type: dbBasis.INTEGER, allowNull: false },
        payment_code:   { type: dbBasis.STRING, allowNull: false, unique: true },
        product_code:   { type: dbBasis.STRING, allowNull: false },
        redeemed:       { type: dbBasis.BOOLEAN, allowNull: false }
    });
};