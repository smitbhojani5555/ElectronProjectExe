module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
    chainWebpack: (config) => {
        config.performance
            .maxEntrypointSize(40000000000000)
            .maxAssetSize(400000000000000);
    },
    transpileDependencies: ["vuetify"],
    runtimeCompiler: true
};