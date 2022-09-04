var InitModules = function() {
    context.player = new Player();
    context.system = new System();
    context.random = new Random();
    context.utils = new Utils();
    context.options = new Options();
    context.energy = new Energy();
    context.defs = new DefGenerator(definitions, {});
    context.case = new Case();
    context.hog = new Hog();
    context.tasks = new Tasks();
    context.partners = new Partners();
    context.events = new Events();
    context.track = new Track();
};
