const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const rename = require("gulp-rename");
const { src, dest, series } = require('gulp');

class Markdown {
    static packages() {
        return src('packages/**/index.source.md')
            .pipe(mdinclude())
            .pipe(rename(function (path) {
                path.basename = "index";
            }))
            .pipe(dest('packages'));
    }

    static functions() {
        return src('functions/**/index.source.md')
            .pipe(mdinclude())
            .pipe(rename(function (path) {
                path.basename = "index";
            }))
            .pipe(dest('functions'));
    }
    
    static apps() {
        return src('apps/**/index.source.md')
            .pipe(mdinclude())
            .pipe(rename(function (path) {
                path.basename = "index";
            }))
            .pipe(dest('apps'));
    }
    
    static components() {
        return src('apps/**/*.docs-source.mdx')
            .pipe(mdinclude())
            .pipe(rename(function (path) {
                console.log(path)
                const dash = path.basename.indexOf("-");
                const name = path.basename.slice(0, dash);

                path.basename = name;
            }))
            .pipe(dest('apps'));
    }

    static readme() {
        return src('README-SOURCE.md')
            .pipe(mdinclude())
            .pipe(toc())
            .pipe(rename(function (path) {
                path.basename = "README";
            }))
            .pipe(dest('.'));
    }
}

class Storybook {
    static components() {
    }
}

exports.default = series(
    Markdown.components,
    Markdown.packages,
    Markdown.functions,
    Markdown.readme
)