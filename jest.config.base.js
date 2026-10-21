module.exports = (dir) => {
  const package = require(`${dir}/package.json`);

  return {
    testEnvironment: "node",
    snapshotFormat: { escapeString: true, printBasicPrototype: true },
    transform: {
      "^.+\\.tsx?$": "babel-jest",
    },
    testMatch: ["<rootDir>/**/__tests__/**/*.test.[jt]s?(x)"],
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    roots: [`<rootDir>`],

    rootDir: dir,
    displayName: package.name,
  };
};
