const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const assetExts = new Set(config.resolver.assetExts);
for (const ext of ["glb", "gltf", "bin"]) {
  assetExts.add(ext);
}
config.resolver.assetExts = Array.from(assetExts);

module.exports = config;
