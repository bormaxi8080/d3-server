var SuspectPropertyQA = {};

SuspectPropertyQA.handle = function(suspect_id, property_name) {
    var suspect = context.case.knownSuspects(suspect_id);
    return SuspectStatePropertyQA.handle(suspect_id, suspect.state, property_name);
};
