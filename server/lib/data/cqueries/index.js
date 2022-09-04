module.exports = {
    checkUser:      require('./CheckUserQuery.js'),
    createUser:     require('./CreateUserQuery.js'),
    ensureUser:     require('./EnsureUserQuery.js'),
    getUser:        require('./GetUserQuery.js'),
    lockUser:       require('./LockUserQuery.js'),
    setToken:       require('./SetTokenQuery.js'),
    migrateUser:    require('./MigrateUserQuery.js'),
    lockUserTransaction: require("./LockUserTransactionQuery.js"),

    createHybridID: require("./HybridIDCreateQuery"),
    getHybridID:    require('./HybridIDGetQuery.js'),
    setHybridID:    require('./HybridIDSetQuery.js'),

    savedStatesGetList: require("./SavedStatesGetListQuery.js"),
    getPaymentsByUser:  require("./GetPaymentsByUserQuery.js"),
    getPaymentsByCode:  require("./GetPaymentsByCodeQuery.js")
};
