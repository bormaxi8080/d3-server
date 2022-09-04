module.exports = {
    AuthorizeHandler:       require('./AuthorizeHandler.js'),
    BodyParser:             require('./BodyParser.js'),

    HybridIDGetHandler:     require('./hybrid/HybridIDGetHandler.js'),
    HybridIDSetHandler:     require('./hybrid/HybridIDSetHandler.js'),

    HealthHandler:          require('./backend/HealthHandler.js'),
    RichHealthHandler:      require('./backend/RichHealthHandler.js'),

    GetUserHandler:         require('./backend/GetUserHandler.js'),
    PrepareUserHandler:     require('./backend/PrepareUserHandler.js'),

    UserDumpHandler:        require('./backend/UserDumpHandler.js'),
    StatesListHandler:      require('./backend/StatesListHandler.js'),
    StatesLoadHandler:      require('./backend/StatesLoadHandler.js'),
    SaveStateHandler:       require('./backend/SaveStateHandler.js'),
    StatesSaveAsHandler:    require('./backend/StatesSaveAsHandler.js'),
    ServicesListHandler:    require('./backend/ServicesListHandler.js'),
    GetPaymentsHandler:     require('./backend/GetPaymentsHandler.js'),

    ErrorReplyHandler:          require('./process/ErrorReplyHandler.js'),
    FetchDataHandler:           require('./process/FetchDataHandler.js'),
    FlushPostprocessHandler:    require('./process/FlushPostprocessHandler.js'),
    FlushPreprocessHandler:     require('./process/FlushPreprocessHandler.js'),
    LockUserHandler:            require('./process/LockUserHandler.js'),
    ProcessHandler:             require('./process/ProcessHandler.js'),
    ProcessPrepareHandler:      require('./process/ProcessPrepareHandler.js'),
    SaveChangesHandler:         require('./process/SaveChangesHandler.js'),
    SuccessReplyHandler:        require('./process/SuccessReplyHandler.js'),
    UnlockUserHandler:          require('./process/UnlockUserHandler.js'),
    SetTokenHandler:            require('./SetTokenHandler.js')
};
