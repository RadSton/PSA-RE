const bitHelper = require("../bitHelper");

module.exports = {
    name: "DBC",
    fileExtention: 'dbc',

    /**
     * 
     * 
     * NOTE: The require(...) statements is there so that autocomplete knows how the object is built up
     * @returns {String} fileContents
     */
    convert: (dbmuxev = require("../../debugging_dbmuxev.json"), arch = "AEE2004.full", bus = "LS.CONF", lang = "en") => {
        if(!dbmuxev.networks[arch])
            return { error: "Invalid architecture"}
        const busInfo = dbmuxev.networks[arch][bus];
        if(!busInfo)
            return { error: "Invalid bus"}
        const messages = dbmuxev.buses[arch][bus];
        const nodes = dbmuxev.nodes[arch]

        /*
        Implemented after:
        https://github.com/stefanhoelzl/CANpy/blob/master/docs/DBC_Specification.md
        and 
        https://github.com/RadSton/PSA-RE/tree/179da2b707fe6923c1d2b91622a96b1eba7a49d2/psa-db-tool/src
        */
        let DBC =
            `
VERSION ""

NS_ : 
	NS_DESC_
	CM_
	BA_DEF_
	BA_
	VAL_
	CAT_DEF_
	CAT_
	FILTER
	BA_DEF_DEF_
	EV_DATA_
	ENVVAR_DATA_
	SGTYPE_
	SGTYPE_VAL_
	BA_DEF_SGTYPE_
	BA_SGTYPE_
	SIG_TYPE_REF_
	VAL_TABLE_
	SIG_GROUP_
	SIG_VALTYPE_
	SIGTYPE_VALTYPE_
	BO_TX_BU_
	BA_DEF_REL_
	BA_REL_
	BA_DEF_DEF_REL_
	BU_SG_REL_
	BU_EV_REL_
	BU_BO_REL_
	SG_MUL_VAL_
    `

        DBC += "\nBS_: " + (busInfo.bitrate != undefined ? busInfo.bitrate : "")

        const nodeList = ["UNKNOWN"];

        let comments = "";

        let values = "";

        for (const [nodeName, nodeData] of Object.entries(nodes)) {
            if (nodeData.bus && nodeData.bus.includes(bus)) {
                nodeList.push(nodeName.replaceAll(" ", "_"));

                if (nodeData.name && nodeData.name[lang])
                    comments += "CM_ BU_ " + nodeName.replaceAll(" ", "_") + " \"" + nodeData.name[lang] + "\";\n";
            }
        }

        DBC += "\n\nBU_: " + nodeList.join(" ") + " \n";

        for (const [messageId, message] of Object.entries(messages)) {
            const nodes = (message.senders && message.senders.length > 0) ? message.senders[0] : "UNKNOWN";
            const reciver = (message.receivers && message.receivers.length > 0) ? message.receivers.join(",") : "UNKNOWN";
            DBC += `\nBO_ ${message.id} ${message.name}: ${message.length} ${nodes}`;

            if (message.comment && message.comment[lang])
                comments += `CM_ BO_ ${message.id} \"${message.comment[lang]}\";\n`;

            for (const [signalName, signal] of Object.entries(message.signals)) {
                if (!signal.bits) {
                    console.warn("[DBC] Had to skip data because signal.bits definition of $magenta" + signalName + "$yellow was missing in $magenta0x" + messageId)
                    continue;
                }
                if (signalName.match(/^\d/)) {
                    console.warn("[DBC] Had to skip data because signal $magenta" + signalName + "$yellow in $magenta0x" + messageId + "$yellow because its name starts with \"0\" and this is incompatible with many dbc program viewers")
                    continue;
                }
                const { length, startBit } = bitHelper.convertDBMUXBitsToBigEndianFormat(signal.bits)

                let unsigned = false;

                if (signal.type && signal.type.startsWith("u"))
                    unsigned = true

                const factor = signal.factor != undefined ? signal.factor : 1;
                const offset = signal.offset != undefined ? signal.offset : 0;
                const min = signal.min != undefined ? signal.min : 0;
                const max = signal.max != undefined ? signal.max : 0;

                let units = signal.units != undefined ? signal.units : "";

                // TODO: DO NOT HARD CODE
                // @<ENDIAN>  
                // ENDIAN : 0 -> big 1 -> little 
                DBC += `\n SG_ ${signalName} : ${startBit}|${length}@1${unsigned ? "+" : "-"} (${factor},${offset}) [${min}|${max}] \"${units}\" ${reciver}`

                if (signal.comment && signal.comment[lang])
                    comments += `CM_ SG_ ${message.id} ${signalName} \"${signal.comment[lang]}\";\n`;


                if (!signal.values) continue;

                let VAL_string = "";

                for (const [val, valueData] of Object.entries(signal.values)) {
                    VAL_string += `${val} \"${valueData[lang]}\" `;
                }

                values += `VAL_ ${message.id} ${signalName} ${VAL_string};\n`;

            }

            DBC += "\n";
        }

        DBC += "\n" + comments;
        DBC += "\n" + values;

        return DBC;
    }
}