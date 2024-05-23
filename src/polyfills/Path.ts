const pathPolyfill = {
    // @ts-ignore
    parse: function (path: string) {
        const [command, ...coordinates] = path.split(" ");
        return {
            command,
            coordinates: coordinates.map((coordinate) => parseFloat(coordinate)),
        };
    },
    // @ts-ignore
    stringify: function (path: { command: string; coordinates: number[] }) {
        return `${path.command} ${path.coordinates.join(" ")}`;
    },
};

export default pathPolyfill;
