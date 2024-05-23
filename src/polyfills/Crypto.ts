export * from "expo-crypto";
const expoCrypto = require("expo-crypto");
const CrypoPolyfill = {
    ...expoCrypto,
    createHash: require("create-hash"),
    randomBytes: (n: number) => {
        return Buffer.from(expoCrypto.getRandomBytes(n));
    },
    pbkdf2: require("pbkdf2"),
    pbkdf2Sync: require("pbkdf2").pbkdf2Sync,
    createHmac: require("create-hmac"),
};

export default CrypoPolyfill;
