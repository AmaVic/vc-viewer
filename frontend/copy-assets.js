const fs = require('fs');
const path = require('path');

// Define source and destination paths
const paths = {
    jquery: {
        js: {
            src: 'node_modules/jquery/dist/jquery.min.js',
            dest: 'src/js/jquery.min.js'
        }
    },
    bootstrap: {
        css: {
            src: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
            dest: 'src/css/bootstrap.min.css'
        },
        js: {
            src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
            dest: 'src/js/bootstrap.bundle.min.js'
        }
    },
    fontawesome: {
        css: [
            {
                src: 'node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css',
                dest: 'src/css/fontawesome.min.css'
            },
            {
                src: 'node_modules/@fortawesome/fontawesome-free/css/solid.min.css',
                dest: 'src/css/solid.min.css'
            },
            {
                src: 'node_modules/@fortawesome/fontawesome-free/css/brands.min.css',
                dest: 'src/css/brands.min.css'
            }
        ],
        webfonts: {
            src: 'node_modules/@fortawesome/fontawesome-free/webfonts',
            dest: 'src/webfonts'
        }
    },
    prismjs: {
        css: [
            {
                src: 'node_modules/prismjs/themes/prism-tomorrow.min.css',
                dest: 'src/css/prism-tomorrow.min.css'
            },
            {
                src: 'node_modules/prismjs/plugins/toolbar/prism-toolbar.min.css',
                dest: 'src/css/prism-toolbar.min.css'
            }
        ],
        js: [
            {
                src: 'node_modules/prismjs/prism.js',
                dest: 'src/js/prism.js'
            },
            {
                src: 'node_modules/prismjs/plugins/toolbar/prism-toolbar.min.js',
                dest: 'src/js/prism-toolbar.min.js'
            },
            {
                src: 'node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
                dest: 'src/js/prism-copy-to-clipboard.min.js'
            },
            {
                src: 'node_modules/prismjs/components/prism-json.min.js',
                dest: 'src/js/prism-json.min.js'
            },
            {
                src: 'node_modules/prismjs/components/prism-javascript.min.js',
                dest: 'src/js/prism-javascript.min.js'
            }
        ]
    },
    html2canvas: {
        js: {
            src: 'node_modules/html2canvas/dist/html2canvas.min.js',
            dest: 'src/js/html2canvas.min.js'
        }
    },
    jspdf: {
        js: {
            src: 'node_modules/jspdf/dist/jspdf.umd.min.js',
            dest: 'src/js/jspdf.umd.min.js'
        }
    },
    themes: {
        src: 'src/themes',
        dest: 'src/themes'
    }
};

// Helper function to copy a file
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
}

// Helper function to copy a directory
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
    console.log(`Copied directory ${src} to ${dest}`);
}

// Copy jQuery
copyFile(paths.jquery.js.src, paths.jquery.js.dest);

// Copy Bootstrap files
copyFile(paths.bootstrap.css.src, paths.bootstrap.css.dest);
copyFile(paths.bootstrap.js.src, paths.bootstrap.js.dest);

// Copy Font Awesome files
paths.fontawesome.css.forEach(file => copyFile(file.src, file.dest));
copyDir(paths.fontawesome.webfonts.src, paths.fontawesome.webfonts.dest);

// Copy Prism.js files
paths.prismjs.css.forEach(file => copyFile(file.src, file.dest));
paths.prismjs.js.forEach(file => copyFile(file.src, file.dest));

// Copy html2canvas
copyFile(paths.html2canvas.js.src, paths.html2canvas.js.dest);

// Copy jsPDF
copyFile(paths.jspdf.js.src, paths.jspdf.js.dest);

// Copy theme files
copyDir(paths.themes.src, paths.themes.dest);

console.log('All assets copied successfully!'); 