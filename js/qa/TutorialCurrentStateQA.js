var TutorialCurrentStateQA = {};

TutorialCurrentStateQA.handle = function() {
    if (context.storage.has_property("tutorial.state")) {
        return context.storage.get_property("tutorial.state");
    } else {
        return null;
    }
};
