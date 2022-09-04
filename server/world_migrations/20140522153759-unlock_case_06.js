//Migration unlock_case_06
var _20140522153759 = function() {
    this.name = "unlock_case_06";
    this.version = 20140522153759;
    this.script_version = "ccc1cb862d12646dc987498f7e2282209bfdfc66";

    this.execute = function(world, rooms, context) {
        context.setStorageDump(world);
        this.utils.add_unlock_case_task(context, "case_05", "case_06", 2);
    }
};
module.exports = new _20140522153759();
