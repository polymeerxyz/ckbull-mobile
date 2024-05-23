import * as FileSystem from "expo-file-system";

const fsPolyfill = {
    readFileSync: FileSystem.readAsStringAsync,
    writeFileSync: FileSystem.writeAsStringAsync,
    unlinkSync: FileSystem.deleteAsync,
    existsSync: FileSystem.getInfoAsync,
    mkdirSync: FileSystem.makeDirectoryAsync,
    readdirSync: FileSystem.readDirectoryAsync,
    statSync: FileSystem.getInfoAsync,
    lstatSync: FileSystem.getInfoAsync,
    realpathSync: FileSystem.getInfoAsync,
    readlinkSync: FileSystem.getInfoAsync,
    renameSync: FileSystem.moveAsync,
    rmdirSync: FileSystem.deleteAsync,
    chmodSync: FileSystem.getInfoAsync,
    chownSync: FileSystem.getInfoAsync,
};

export default fsPolyfill;
