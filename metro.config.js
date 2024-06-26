// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver = {
    extraNodeModules: {
        crypto: path.resolve(__dirname, "src/polyfills/Crypto"),
        fs: path.resolve(__dirname, "src/polyfills/FileSystem"),
        path: path.resolve(__dirname, "src/polyfills/Path"),
        stream: require.resolve("readable-stream"),
        http: path.resolve(__dirname, "src/polyfills/Http"),
        https: path.resolve(__dirname, "src/polyfills/Https"),
        zlib: path.resolve(__dirname, "src/polyfills/Zlib"),
        util: path.resolve(__dirname, "src/polyfills/Util"),
    },
};

module.exports = config;
