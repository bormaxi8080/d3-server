var SuspectCustomPropertiesQA = {};

SuspectCustomPropertiesQA.handle = function() {
    var property_descriptions = context.defs.get_def("interface.suspect.properties");
    var case_properties = context.case.caseDef().suspect_properties;

    var target = {};
    for (var property_index in case_properties) {
        target[property_index] = property_descriptions[case_properties[property_index]];
    }
    return target;
};
