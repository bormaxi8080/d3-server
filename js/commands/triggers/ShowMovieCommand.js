var ShowMovieCommand = function() {};

ShowMovieCommand.toString = function() {
    return "show_movie";
};

ShowMovieCommand.prototype.execute = function(movie_id) {
    context.events.showMovie(movie_id);
};
