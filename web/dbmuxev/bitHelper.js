// This file contains a little suffering 
// Originaly wanted to base this on https://github.com/RadSton/PSA-RE/commit/247a8fa632d1fe00c7b4fc055f06930bf77090d0#diff-856037e48e5b11ecbda37a2786352dcf9f0ef3bc8252d676511e91d50eac6724R160-R170
// but I think only the reversing was "directly" copied
// it works thank god


/**
 * This function converts 
 * 
 * @param {"1.7-1.0"} bits "bits" string from signals
 * @returns {{length: 1, startBit: 10}}
 */

module.exports.convertDBMUXBitsToBigEndianFormat = (bits) => {
    const raw = bits.replaceAll(".", "").split("-").map((x) => Number.parseInt(x)); // List of raw values without dot // f.e. "1.7-1.0" -> [7, 0] or "5.0" -> [32]
    const parsed = raw.map(convertToBigEndianLocation);

    let data = {
        length: 1,
        startBit: parsed[0]
    }

    if (parsed.length == 1)
        return data;

    if (yamlFormatFromBit(raw[0]) < yamlFormatFromBit(raw[1])) {
        data.startBit = parsed[0];
        data.length = parsed[1] - parsed[0];

        if ((parsed[1] - parsed[0]) < 0) {
            data.startBit = parsed[1];
            data.length = parsed[0] - parsed[1];
        }
    } else {
        data.startBit = parsed[1];
        data.length = parsed[0] - parsed[1];
        if ((parsed[0] - parsed[1]) < 0) {
            data.startBit = parsed[0];
            data.length = parsed[1] - parsed[0];
        }
    }

    data.length += 1;

    return data;
}

// Functions made with help of GeoGebra and a lot of brainpower
const yamlFormatFromBit = (x) => {
    return Math.floor(x / 10) * 8 - (x % 10) - 1;
}

const convertToBigEndianLocation = (value) => {
    const yml = yamlFormatFromBit(value);
    const bitPositionModulo = (yml % 8);
    return (yml - bitPositionModulo) + (7 - bitPositionModulo);
}