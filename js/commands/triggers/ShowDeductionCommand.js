var ShowDeductionCommand = function() {};

ShowDeductionCommand.toString = function() {
    return "show_deductiond";
};

ShowDeductionCommand.prototype.execute = function(deduction_id) {
    if (!context.case.hasDeduction(deduction_id)) {
        throw new LogicError("Дедукция " + deduction_id + " недоступена в деле " + context.case.activeCase());
    }

    context.events.showDeduction(deduction_id, context.case.deductions(deduction_id));
};
