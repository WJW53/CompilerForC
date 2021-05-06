module.exports = {
    lintOnSave: false,//不要eslint检查,烦人
    devServer: {
        open: true,
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    }
};
