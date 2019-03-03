var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconf.json");
var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("compile", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series("copy-html", "compile"));
