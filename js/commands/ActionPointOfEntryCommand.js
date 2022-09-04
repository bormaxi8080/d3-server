var CommandNames = {
    ACTION_POINT_OF_ENTRY: "action_point_of_entry"
}

var ActionPointOfEntryCommand = function() {
    const FAKE = "fake";

    var click_commands = {};
    var first_line_commands = {};
    first_line_commands[BroadcastUnlockRequestCommand] = true;
    first_line_commands[BuyPackCommand] = true;
    first_line_commands[BuyBoosterCommand] = true;
    first_line_commands[ClickForensicItemCommand] = true;
    first_line_commands[ClickLabItemCommand] = true;
    first_line_commands[ClickSuspectCommand] = true;
    first_line_commands[ClickTaskCommand] = true;
    first_line_commands[DeletePartnerCommand] = true;
    first_line_commands[DropActiveMinigameCommand] = true;
    first_line_commands[DropActiveSceneCommand] = true;
    first_line_commands[DropTutorialCommand] = true;
    first_line_commands[EndMinigameCommand] = true;
    first_line_commands[EndSceneCommand] = true;
    first_line_commands[ExecuteNextTriggerCommand] = true;
    first_line_commands[OpenCaseCommand] = true;
    first_line_commands[ProgressTutorialCommand] = true;
    first_line_commands[ResetPartnerCommand] = true;
    first_line_commands[SpeedupLabItemCommand] = true;
    first_line_commands[StartDayCommand] = true;
    first_line_commands[StartMinigameCommand] = true;
    first_line_commands[StartSceneCommand] = true;
    first_line_commands[TickEnergyCommand] = true;
    first_line_commands[InvitePartnerCommand] = true;
    first_line_commands[UnlockCaseCommand] = true;
    first_line_commands[UseItemCommand] = true;
    first_line_commands[UseServiceResultCommand] = true;

    /**
     * command_name - название игрового действия, которое обрабатываем
     * args - для каждой команды выглядит по-своему
     */
    this.execute = function(command_name, args) {
        if (command_name in click_commands) {
            // Executor.run(CommandNames.CLICK, command_name, args);
        } else if (command_name in first_line_commands) {
            Executor.run(command_name, args);
        } else if (command_name == FAKE) {
            //Пустая команда. Вызывается с клиента только для того чтобы прошелся определенный квест (к примеру, квест "кликни на кнопку")
        } else {
            throw new LogicError("На входе недоступен обработчик команды '" + command_name + "'.");
        }
    };
};

ActionPointOfEntryCommand.toString = function() {
    return "action_point_of_entry"
};
