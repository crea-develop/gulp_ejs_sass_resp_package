
const assets_folder_path = 'assets/';
const css_folder_path    = assets_folder_path + 'css/';
const js_folder_path     = assets_folder_path + 'js/';

const common_js = [
    'src/' + js_folder_path + 'common/jquery.js'
];


var paths = {
    dev     : 'dev/',
    dist    : 'dist/',
    release : 'release/',
    image   : 'src/**/*.+(jpg|gif|png)',
    others  : 'src/**/*.!(scss|*.scss|js|*.js|ejs|*.ejs|jpg|gif|png|*.jpg|*.gif|*.png)',
    ejs     : {
        watch : 'src/**/*.ejs',
        src   : 'src/**/!(_)*.ejs'
    },
    css     : {
        watch   : 'src/**/*.scss',
        default : ['src/**/*.scss', '!src/' + css_folder_path + '**/*.scss'],
        concat  : 'src/'     + css_folder_path + '**/*.scss',
        dev     : 'dev/'     + css_folder_path,
        dist    : 'dist/'    + css_folder_path,
        release : 'release/' + css_folder_path
    },
    js      : {
        watch   : 'src/**/*.js',
        default : ['src/**/*.js', '!src/' + js_folder_path + 'common/**/*.js'],
        common  : common_js,
        dev     : 'dev/'     + js_folder_path,
        dist    : 'dist/'    + js_folder_path,
        release : 'release/' + js_folder_path
    }
};
const defaultSet = {
    paths : paths
};

module.exports = {
    default : defaultSet
};