let defaultLang = "en";

const searchList = document.querySelector(".searchList");
const renderingDetails = document.querySelector(".renderingDetails");
const selectedInfo = document.querySelector(".selectedInfo");
const search = document.querySelector(".search > input");

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

const renderArchitectureSelector = (architectureContainer) => {
    console.log("renderArchitectureSelector", architectureContainer)

    searchList.style.display = "block";
    selectedInfo.style.display = "none";

    renderingDetails.innerHTML = `Select a architecture ${languageSwitcher()}`;

    if (architectureContainer.error) {
        searchList.innerHTML =
            `<div style="display: block; text-align: center;">
            <h1>Failed to load architectures:</h1> 
            <h5>${architectureContainer.error}</h5>
            <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
        </div>`;
        return;
    }

    let result = "";

    for (const baseArchKey in architectureContainer) {
        for (const [baseVariantKey, arch] of Object.entries(architectureContainer[baseArchKey])) {
            const archKey = baseArchKey + "." + baseVariantKey;
            let note = arch.comment ? "Comment: " + arch.comment[defaultLang] : "";
            let networks = arch.networks ? "Networks: " + Object.keys(arch.networks).join(", ") : "";
            let protocols = arch.protocols ? "Protocols: " + arch.protocols.join(", ") : "";

            if (typeof arch == 'string')
                networks = "Note: " + arch;


            result += printSearchResultElementArch(archKey, note, networks, protocols);
        }
    }

    searchList.innerHTML = result;
}

const renderArchInfo = (arch, fullArchitectureName) => {
    console.log("renderArchInfo", arch, fullArchitectureName)

    selectedInfo.style.display = "block";
    searchList.style.display = "none";
    renderingDetails.innerHTML = ``;

    if (!arch) {
        selectedInfo.innerHTML = `
        <span class="selTitle">The architecture <span class="selType">${architectureName}</span> wasnt found in <span class="selType">architectures.yml</span></span>
        <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
        `;
        return;
    }

    if (arch.error) {
        selectedInfo.innerHTML = `
        <span class="selTitle">Error when loading <span class="selType">${architectureName}</span> from <span class="selType">architectures.yml</span></span>
        <span class="selTitle">Error: <span class="selType">${arch.error}</span></span>
        <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
        `;
        return;
    }

    const nameArchParts = fullArchitectureName.split(".");
    const architectureName = nameArchParts[0];
    const architectureVariant = nameArchParts[1];


    selectedInfo.innerHTML = `
        <span class="selTitle"><span class="selType">architectures</span>.yml -> <span class="selType">${architectureName}</span></span>
    `;

    renderingDetails.innerHTML = `Showing architecture ${fullArchitectureName} ${languageSwitcher()}`;

    const addField = (field, value) => selectedInfo.innerHTML += `<span class="field">${field}<span class="fieldValue">${value}</span></span>`
    const addTreeField = (field, value, depth) => selectedInfo.innerHTML += `<span class="field" data-depth="${depth}">${field}<span class="fieldValue">${value}</span></span>`

    addField("Architecture: ", architectureName)
    addField("Variant: ", architectureVariant)

    if (arch.comment)
        addField("Comment: ", arch.comment[defaultLang]);

    if (arch.protocols)
        selectedInfo.innerHTML += `<span class="fieldTitle">Protocols:</span>`;

    for (const protocol of arch.protocols)
        addTreeField(" -> ", protocol, 1);



    if (arch.networks)
        selectedInfo.innerHTML += `<span class="fieldTitle">Networks:</span>`;

    for (const [networkName, network ] of Object.entries(arch.networks)) {
        addTreeField(" -> Network: ", `<a href="/buses?arch=${fullArchitectureName}&network=${networkName}" class="fieldLink">${networkName}</a>`, 1);
        for(const busName in network) {
            const bus = network[busName];
            addTreeField(" -> Bus: ", `<a href="/buses?arch=${fullArchitectureName}&network=${networkName}&bus=${busName}" class="fieldLink">${busName}</a>`, 2);

            if(bus.display_name) 
                addTreeField(" -> Name: ", bus.display_name[defaultLang], 3);
            
            if(bus.comment) 
                addTreeField(" -> Note: ", bus.comment[defaultLang], 3);
        }
        addTreeField(":---------:", "", 1);
    }

}

/**
 * 
 * @param {HTMLDivElement} element 
 */
const onNodeClick = (element) => {
    let arch = element.getAttribute("data-arch");
    if (!arch) return;

    let link = location.origin + "/architectures?";

    if (arch) link += "arch=" + arch + "&";

    history.pushState(null, null, link);

    onLoad();
}

const onLoad = () => {
    const urlParams = new URLSearchParams(location.search);
    const archParam = urlParams.get("arch");

    selectedInfo.style.display = "none";
    searchList.style.display = "none";

    if (!archParam) {
        // Show arch select
        requestJSON("GET", "/api/v1/architectures").then((a) => renderArchitectureSelector(a));
        return;
    }

    // show arch
    requestJSON("GET", "/api/v1/architecture/" + archParam).then((a) => renderArchInfo(a, archParam));
}

search.addEventListener("keyup", () => {
    if (search.value.length < 1) {
        onLoad();
        return;
    }

    requestJSONWithBody("POST", "/api/v1/architecture/search", {
        query: search.value
    }).then((data) => {
        renderArchitectureSelector(data);
    })
})

onLoad();