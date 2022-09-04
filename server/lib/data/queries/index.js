module.exports = {
    isUserExists: require("./IsUserExistsQuery"),
    unlockUser:   require("./UnlockUserQuery"),
    lockUserExt:  require("./LockUserExtQuery"),

    getCache: require("./CacheGetQuery"),
    setCache: require("./CacheSetQuery"),

    getWorldData: require("./WorldDataGetQuery"),
    setWorldData: require("./WorldDataSetQuery"),

    getRoomData:    require("./RoomDataGetQuery"),
    setRoomData:    require("./RoomDataSetQuery"),
    createRoomData: require("./RoomDataCreateQuery"),

    getChangeLog:   require("./ChangeLogGetQuery"),
    addChangeLog:   require("./ChangeLogAddQuery"),
    clearChangeLog: require("./ChangeLogClearQuery"),

    addUserLog:  require("./AddUserLogQuery"),
    getUserLogs: require("./GetUserLogsQuery"),

    savedStatesGet:     require("./SavedStatesGetQuery"),
    savedStatesSet:     require("./SavedStatesSetQuery"),
    createUseShare:     require("./CreateUseShareQuery"),

    getActualWorldData:   require("./GetActualWorldData"),
    getActualRoomData:    require("./GetActualRoomData"),
    flushData:            require("./FlushData"),
    flushChangeLogs:      require("./FlushChangeLogs"),
    ensureData:           require("./EnsureData"),

    saveServiceChanges:   require("./SaveServiceChanges"),
    getUnusedServices:    require("./GetUnusedServices"),
    getRoomIds:           require("./GetRoomIdsQuery.js"),

    getUserLogByShardIdLogId: require("./GetUserLogByShardIdLogIdQuery"),

    migrateData:         require("./MigrateDataQuery.js"),
    stateSet:            require("./StateSetQuery.js"),
    stateGet:            require("./StateGetQuery.js"),

    getServiceRequests: require("./GetServiceRequestsQuery"),
    serviceExecute:     require("./ServiceExecuteQuery"),
    serviceChange:      require("./ServiceChangeQuery"),
    serviceClear:       require("./ServiceClearQuery"),
    serviceQuery:       require("./ServiceQueryQuery"),
    servicesDelete:     require("./ServicesDeleteQuery"),

    getUserSavesStatesList: require("./GetUserSavesStatesListQuery"),
    getUserSavesStatesGet:  require("./GetUserSavesStatesGetQuery"),

    highscoresGetQuery: require("./HighscoresGetQuery"),
    levelsGetQuery:     require("./LevelsGetQuery"),
    hintsGetQuery:      require("./HintsGetQuery"),

    shareAdd: require("./CreateShareQuery"),
    getTokens: require("./GetTokensQuery"),

    getHybridUsers:       require("./HybridUsersQuery"),
    getHybridSocialUsers: require("./HybridSocialUsersQuery"),

    paymentAdd:           require("./PaymentAddQuery"),
    paymentDelete:        require("./PaymentDeleteQuery"),
    filterNewPayments:    require("./FilterNewPaymentsQuery")
};
