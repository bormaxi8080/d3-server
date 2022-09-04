var GetRandomFromSeedQA = {}

GetRandomFromSeedQA.handle = function(seed) {
    return context.random.generate_from_seed(seed).result;
};
