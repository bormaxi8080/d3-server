var SuspectStatePropertyQA = {};

SuspectStatePropertyQA.handle = function(suspect_id, state, property_name) {
    var suspect_prop = context.case.suspectsProp(suspect_id);
    var suspect_prop_name = [suspect_prop, "states", state, property_name].join('.');
    if (context.defs.has_def(suspect_prop_name)) {
        return context.defs.get_def(suspect_prop_name);
    } else {
        var default_prop = [suspect_prop, "states.default", property_name].join('.');
        if (context.defs.has_def(default_prop)) {
            return context.defs.get_def(default_prop);
        } else {
            return "";
        }
    }
};
