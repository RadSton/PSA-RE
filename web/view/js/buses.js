let defaultLang = "en";

const searchList = document.querySelector(".searchList");
const renderingDetails = document.querySelector(".renderingDetails");
const selectedInfo = document.querySelector(".selectedInfo");
const search = document.querySelector(".search > input");


// ?arch=AEE2004.full&network=HS&bus=IS&message=0x208

const printSearchResultElementArch = (name, comment, codes, codeName) =>
    `<div class="searchResult" data-arch=${name}  onclick="onNodeClick(this)">
         <span class="searchResultId searchResultIdSmall">${name}</span>
         <div class="searchResultInfo">
            <span class="searchResultName">${comment}</span>
            <span class="searchResultCodes">${codes}</span>
            <span class="searchResultCodesName">${codeName}</span>
         </div>
     </div>`;

const printSearchResultElementNetwork = (name, comment, codes, codeName) =>
    `<div class="searchResult" data-network=${name}  onclick="onNodeClick(this)">
        <span class="searchResultId searchResultIdSmall">${name}</span>
        <div class="searchResultInfo">
            <span class="searchResultName">${comment}</span>
            <span class="searchResultCodes">${codes}</span>
            <span class="searchResultCodesName">${codeName}</span>
        </div>
     </div>`;

const printSearchResultElementBus = (name, comment, codes, codeName) =>
    `<div class="searchResult" data-bus=${name}  onclick="onNodeClick(this)">
        <span class="searchResultId searchResultIdSmall">${name}</span>
        <div class="searchResultInfo">
            <span class="searchResultName">${comment}</span>
            <span class="searchResultCodes">${codes}</span>
            <span class="searchResultCodesName">${codeName}</span>
        </div>
     </div>`;

const printSearchResultElementMessage = (name, comment, codes, codeName) =>
    `<div class="searchResult" data-message=${name}  onclick="onNodeClick(this)">
        <span class="searchResultId searchResultIdSmall">${name}</span>
        <div class="searchResultInfo">
            <span class="searchResultName">${comment}</span>
            <span class="searchResultCodes">${codes}</span>
            <span class="searchResultCodesName">${codeName}</span>
        </div>
     </div>`;

const languageSwitcher = () => `<span class="languageSwitcher">(Language: <span ${defaultLang == "en" ? `data-sel` : `onClick="language('en')"`}>English</span> / <span ${defaultLang == "fr" ? `data-sel` : `onClick="language('fr')"`}> French</span>)</span>`;

const language = (lang) => {
    defaultLang = lang;
    onLoad();
}

const setLockedSearch = (state) => {
    if (state)
        search.value = "";
    search.disabled = state;
    search.placeholder = state ? "Choose an architecture before searching" : "Start typing to search for a node";
}

/**
 * 
 * @param {HTMLDivElement} element 
 */
const onNodeClick = (element) => {
    // ?arch=AEE2004.full&network=HS&bus=IS&message=0x208

    const urlParams = new URLSearchParams(location.search);

    let arch = element.getAttribute("data-arch");
    let network = element.getAttribute("data-network");
    let bus = element.getAttribute("data-bus");
    let message = element.getAttribute("data-message");

    if (!arch) arch = urlParams.get("arch");
    if (!network) network = urlParams.get("network");
    if (!bus) bus = urlParams.get("bus");
    if (!message) message = urlParams.get("message");

    let link = location.origin + "/buses?";

    if (arch) link += "arch=" + arch + "&";
    if (network) link += "network=" + network + "&";
    if (bus) link += "bus=" + bus + "&";
    if (message) link += "message=" + message + "&";

    history.pushState(null, null, link);

    onLoad();
}

const onLoad = async () => {
    const urlParams = new URLSearchParams(location.search);

    // ?arch=AEE2004.full&network=HS&bus=IS&message=0x208
    const arch = urlParams.get("arch");
    const network = urlParams.get("network");
    const bus = urlParams.get("bus");
    const message = urlParams.get("message");

    selectedInfo.style.display = "none";
    searchList.style.display = "none";

    setLockedSearch(true);

    let buses = await requestJSON("GET", "/api/v1/buses");

    if (!arch || !buses[arch]) {
        renderArchitectureSelector(buses)
        return;
    }

    let networkNames = Object.keys(buses[arch]).map(x => x.split(".")[0]);

    if (!network || !networkNames.includes(network)) {
        renderNetworkSelector(buses, networkNames, arch);
        return;
    }

    let busNames = Object.keys(buses[arch]).filter(x => x.startsWith(network)).map(x => x.split(".")[1]);

    if (!bus || !busNames.includes(bus)) {
        renderBusSelector(buses, busNames, arch, network);
        return;
    }

    let messages = buses[arch][network + "." + bus];

    setLockedSearch(false);

    if (!message) {
        renderMessageSelector(buses, messages, arch, network, bus);
        return;
    }

    renderMessageInfo(buses, messages[message.replaceAll("0x", "")], arch, network, bus, message);
}


const renderArchitectureSelector = (buses) => {

    console.log("Rendering architecture selector ...");

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a architecture ${languageSwitcher()}`;

    let result = "";

    for (const architecture of Object.keys(buses)) {
        const split = architecture.split(".");
        result += printSearchResultElementArch(architecture, "Architecture: " + split[0], "Variant: " + split[1], "Cars after " + split[0].replaceAll("AEE", ""));
    }

    searchList.innerHTML = result;
}

const renderNetworkSelector = (buses, networkNames, arch) => {
    console.log("Rendering network selector ...");

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a network ${languageSwitcher()}`;

    let result = "";

    for (const network of networkNames) {
        result += printSearchResultElementNetwork(network, "", "", "");
    }

    searchList.innerHTML = result;
}


const renderBusSelector = (buses, busNames, arch, network) => {
    console.log("Rendering bus selector ...");

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a bus from ${network} in ${arch} ${languageSwitcher()}`;

    let result = "";

    for (const bus of busNames) {
        result += printSearchResultElementBus(bus, "", "", "");
    }

    searchList.innerHTML = result;
}

const renderMessageSelector = (buses, messages, arch, network, bus) => {
    console.log("Rendering message selector ...");

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a message from ${network}.${bus} in ${arch} ${languageSwitcher()}`;

    let result = "";

    for (const [message, data] of Object.entries(messages)) {
        const name = data.name ? "Name: " + data.name : "";
        const comment = data.comment ? "Comment: " + data.comment[defaultLang] : "";
        const signals = data.signals ? "Signals: " + Object.keys(data.signals).join(", ") : "";
        result += printSearchResultElementMessage(toHexString(message, 3), name, comment, signals);
    }

    searchList.innerHTML = result;
}

const renderMessageInfo = (buses, message, arch, network, bus, messageId) => {
    console.log("Rendering message info ...");

    selectedInfo.style.display = "block";
    searchList.style.display = "none";
    renderingDetails.innerHTML = ``;

    if (!message) {
        selectedInfo.innerHTML = `
        <span class="selTitle">The message <span class="selType">${messageId}</span> wasnt found in ${arch}/${network}.${bus}</span>
        <span class="selTitle"><a class="headerLink selected" href="/buses">Reset filters</a></span>
        `;
        return;
    }

    selectedInfo.innerHTML = `
        <span class="selTitle"><span class="selType">${arch}</span>/<span class="selType">${network}.${bus}</span>/<span class="selType">${messageId.replaceAll("0x", "")}</span>.yml -> <span class="selType">${messageId}</span></span>
    `;

    renderingDetails.innerHTML = `Showing message ${messageId} ${languageSwitcher()}`;

    const addField = (field, value) => selectedInfo.innerHTML += `<span class="field">${field}<span class="fieldValue">${value}</span></span>`
    const addTreeField = (field, value, depth) => selectedInfo.innerHTML += `<span class="field" data-depth="${depth}">${field}<span class="fieldValue">${value}</span></span>`

    addField("Id: ", messageId);
    if (message.name)
        addField("Name: ", message.name);
    if (message.comment)
        addField("Comment: ", message.comment[defaultLang]);
    if (message.alt_names)
        addField("Alternative names: ", message.alt_names.join(", "));
    if (message.type)
        addField("Type: ", message.type);
    if (message.periodicity)
        addField("Periodicity: ", message.periodicity);
    if (message.length)
        addField("Length: ", message.length);

    selectedInfo.innerHTML += `<span class="fieldTitle">Nodes:</span>`;

    if (message.senders && message.senders.length > 0) {
        addTreeField("-> Senders: ", "", 1);

        for (const sender of message.senders)
            addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${arch}&node=${sender}">${sender}</a>`, 2)
    }

    if (message.receivers && message.receivers.length > 0) {
        addTreeField("-> Receivers: ", "", 1);

        for (const sender of message.receivers)
            addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${arch}&node=${sender}">${sender}</a>`, 2)
    }

    selectedInfo.innerHTML += `<span class="fieldTitle">Signals:</span>`;

    const checkedTreeField = (a, b, c) => {
        if (!a || !b || !c) return;
        addTreeField(a, b, c);
    }

    for (const signalName in message.signals) {
        const signal = message.signals[signalName];
        addTreeField("-> ", signalName, 1);
        if (signal.comment)
            checkedTreeField("-> Comment: ", signal.comment[defaultLang], 2);
        checkedTreeField("-> Bits: ", signal.bits, 2);
        checkedTreeField("-> Unused: ", signal.unused, 2);
        if (signal.alt_names)
            checkedTreeField("-> Alternative Names: ", signal.alt_names.join(", "), 2);
        checkedTreeField("-> type: ", signal.type, 2);
        checkedTreeField("-> Min: ", signal.min, 2);
        checkedTreeField("-> Max: ", signal.max, 2);
        checkedTreeField("-> Units: ", signal.units, 2);
        checkedTreeField("-> Offset: ", signal.offset, 2);
        checkedTreeField("-> factor: ", signal.factor, 2);

        if (!signal.values) {
            addField("-------------------", "");
            continue;
        }
        checkedTreeField("-> values: ", signal.factor, 2);

        for (const [valKey, val] of Object.entries(signal.values)) {
            checkedTreeField("-> "+ toHexString(valKey, 2) + ": ", val[defaultLang], 3);
        }

        addField("-------------------", "");
    }
}

search.addEventListener("keyup", () => {
    if (search.value.length < 1) {
        onLoad();
        return;
    }

    const urlParams = new URLSearchParams(location.search);

    const arch = urlParams.get("arch");
    const network = urlParams.get("network");
    const bus = urlParams.get("bus");

    if(!arch || !network || !bus) {
        onLoad();
        return;
    }

    requestJSONWithBody("POST", "/api/v1/buses/search", {
        query: search.value,
        arch,
        identifyer: network + "." + bus

    }).then((data) => {
        renderMessageSelector(undefined, data, arch, network, bus); // INFO: when changing renderMessageSelector to use buses variable this will cause an error!
    })
})




onLoad();

window.addEventListener('popstate', onLoad, false);