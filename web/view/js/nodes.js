let defaultLang = "en";

const searchList = document.querySelector(".searchList");
const renderingDetails = document.querySelector(".renderingDetails");
const selectedInfo = document.querySelector(".selectedInfo");
const search = document.querySelector(".search > input");

const printSearchResultElementNode = (nodeId, nodeName, nodeCodes, nodeCodesName) =>
    `<div class="searchResult" data-node="${nodeId}" onclick="onNodeClick(this)">
         <span class="searchResultId">${nodeId}</span>
         <div class="searchResultInfo">
             <span class="searchResultName">${nodeName}</span>
             <span class="searchResultCodes">${nodeCodes}</span>
             <span class="searchResultCodesName">${nodeCodesName}</span>
         </div>
     </div>`;


const printSearchResultElementArch = (nodeArch, nodeName, nodeCodes, nodeCodesName) =>
    `<div class="searchResult" data-arch=${nodeArch}  onclick="onNodeClick(this)">
         <span class="searchResultId searchResultIdSmall">${nodeArch}</span>
         <div class="searchResultInfo">
             <span class="searchResultName">${nodeName}</span>
             <span class="searchResultCodes">${nodeCodes}</span>
             <span class="searchResultCodesName">${nodeCodesName}</span>
         </div>
     </div>`;

const languageSwitcher = () => `
     <span class="languageSwitcher">(Language: <span ${defaultLang == "en" ? `data-sel` : `onClick="language('en')"`}>English</span> / <span ${defaultLang == "fr" ? `data-sel` : `onClick="language('fr')"`}> French</span>)</span>
     `

const language = (lang) => {
    defaultLang = lang;
    onLoad();
}

const setLockedSearch = (state) => {
    search.value = "";
    search.disabled = state;
    search.placeholder = state ? "Choose an architecture before searching" : "Start typing to search for a node";
}

const renderArchSelector = (nodesList) => {
    console.log("Rendering architecture selector ...");

    renderingDetails.innerHTML = `Select Architecture ${languageSwitcher()}`;
    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    let result = "";

    result += "<h5 style=\"text-align: center;\">You need to select an architecture beforehand</h5>";

    for (const node of nodesList) {
        const res = node.split(".");
        result += printSearchResultElementArch(node, "For cars after " + res[0].replaceAll("AEE", ""), "Architecture: " + res[0], "Variant: " + res[1]);
    }

    searchList.innerHTML = result;
}

const renderNodeSelector = (nodeContainer, nodeArch) => {
    console.log("Rendering node selector ...");

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a node from ${nodeArch} (${Object.keys(nodeContainer).length}) ${languageSwitcher()}`;

    if (nodeContainer.error) {
        searchList.innerHTML =
            `<div style="display: block; text-align: center;">
            <h1>Failed to load nodes:</h1> 
            <h5>${nodeContainer.error}</h5>
            <span class="selTitle"><a class="headerLink selected" href="/nodes">Reset filters</a></span>
        </div>`;
        return;
    }

    let result = "";

    for (const [nodeKey, node] of Object.entries(nodeContainer)) {
        let name = node.name ? "Name: " + node.name[defaultLang] : "";
        let altName = node.alt ? "Alternative names: " + node.alt.join(", ") : "";
        let comment = node.comment ? "Comment: " + node.comment[defaultLang] : "";

        result += printSearchResultElementNode(nodeKey, name, altName, comment);
    }

    searchList.innerHTML = result;
}

// TODO: make work with alt names for example: RT3
const renderNodeInfo = async (nodeContainer, nodeId, nodeArch) => {
    console.log("Rendering node info screen ...");

    let node = nodeContainer[nodeId];

    selectedInfo.style.display = "block";
    searchList.style.display = "none";
    renderingDetails.innerHTML = ``;

    if (!node) {
        const nodeByAlt = await requestJSONWithBody("POST", "/api/v1/node/" + nodeArch + "/findByAlt", {
            nodeName: nodeId
        })

        if (!nodeByAlt.error) {
            const [newKey, newNode] = Object.entries(nodeByAlt)[0]
            node = newNode;
            nodeId = newKey;
        }
    }

    if (!node) {
        selectedInfo.innerHTML = `
        <span class="selTitle">The node <span class="selType">${nodeId}</span> wasnt found in  <span class="selType">${nodeArch}</span></span>
        <span class="selTitle"><a class="headerLink selected" href="/nodes">Reset filters</a></span>
        `;
        return;
    }



    selectedInfo.innerHTML = `
        <span class="selTitle">nodes/<span class="selType">${nodeArch}</span>.yml -> <span class="selType">${nodeId}</span></span>
    `;

    if (node.redirectedFrom) {
        selectedInfo.innerHTML += `<span class="field" style="text-align: center; padding-bottom: 1vh;">Redirected from <span class="selType">${node.redirectedFrom}</span> to <span class="selType">${nodeId}</span></span>`;
    }

    const addField = (field, value) => selectedInfo.innerHTML += `<span class="field">${field}<span class="fieldValue">${value}</span></span>`
    const addTreeField = (field, value, depth) => selectedInfo.innerHTML += `<span class="field" data-depth="${depth}">${field}<span class="fieldValue">${value}</span></span>`

    if (node.name)
        addField("Name: ", node.name[defaultLang])

    if (node.alt)
        addField("Alternative node names: ", node.alt.join(", "));

    if (node.comment)
        addField("Comment: ", node.comment[defaultLang]);

    if (node.bus && node.bus.length > 0)
        selectedInfo.innerHTML += `<span class="fieldTitle">Busses:</span>`;

    for (const bus of node.bus) {
        const splitName = bus.split(".");
        const network = splitName[0];
        const busName = splitName[1];
        addTreeField(" -> ", `<a class="fieldLink" href="/buses?arch=${nodeArch}&network=${network}&bus=${busName}">${bus}</a>`, 1);
    }

    if (node.id)
        selectedInfo.innerHTML += `<span class="fieldTitle">Identifiers:</span>`;

    for (const [key, id] of Object.entries(node.id))
        addTreeField(" -> " + key + ": ", "0x" + id, 1);

    renderingDetails.innerHTML = `Showing node ${nodeId} from ${nodeArch} ${languageSwitcher()}`;
}

/**
 * 
 * @param {HTMLDivElement} element 
 */
const onNodeClick = (element) => {

    let node = element.getAttribute("data-node");
    let arch = element.getAttribute("data-arch");
    if (!node && !arch) return;

    if (!arch)
        arch = (new URLSearchParams(location.search)).get("arch");

    if (node == arch) node = "";

    let link = location.origin + "/nodes?";

    if (arch) link += "arch=" + arch + "&";
    if (node) link += "node=" + node + "&";

    history.pushState(null, null, link);

    onLoad();
}

const onLoad = () => {
    const urlParams = new URLSearchParams(location.search);

    const nodeParam = urlParams.get("node");
    const archParam = urlParams.get("arch");

    selectedInfo.style.display = "none";
    searchList.style.display = "none";

    console.log("Loading page ...");

    if (!archParam) {
        // Show arch select
        setLockedSearch(true);
        requestJSON("GET", "/api/v1/nodes").then((a) => renderArchSelector(a));
        return;
    }

    setLockedSearch(false);

    if (!nodeParam) {
        // Show node select
        requestJSON("GET", "/api/v1/nodes/" + archParam).then((a) => renderNodeSelector(a, archParam));
        return;
    }

    // show node
    requestJSON("GET", "/api/v1/nodes/" + archParam).then((a) => renderNodeInfo(a, nodeParam, archParam));
}

search.addEventListener("keyup", () => {
    if (search.value.length < 1) {
        onLoad();
        return;
    }

    const arch = new URLSearchParams(location.search).get("arch");

    if (!arch) {
        setLockedSearch(true);
        onLoad();
        return;
    }

    console.log("Searching for \"" + search.value + "\"");

    requestJSONWithBody("POST", "/api/v1/node/" + arch + "/search", {
        query: search.value
    }).then((data) => {
        renderNodeSelector(data, arch);
    })
})

onLoad();

window.addEventListener('popstate', onLoad, false);