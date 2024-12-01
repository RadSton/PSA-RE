const searchList = document.querySelector(".searchList");
const renderingDetails = document.querySelector(".renderingDetails");
const selectedInfo = document.querySelector(".selectedInfo");
const search = document.querySelector(".search > input");

const printSearchResultElement = (carId, carName, carCodes, carCodesName) =>
    `<div class="searchResult" data-car="${carId}" onclick="onCarClick(this)">
         <span class="searchResultId">${carId}</span>
         <div class="searchResultInfo">
             <span class="searchResultName">${carName}</span>
             <span class="searchResultCodes">${carCodes}</span>
             <span class="searchResultCodesName">${carCodesName}</span>
         </div>
     </div>`;


const renderCarListFromData = (data) => {
    console.log("Rendering car selector ...");

    selectedInfo.style.display = "none";
    searchList.style.display = "block";

    let toRender = "";
    let carCounter = 0;

    for (const [carId, car] of Object.entries(data)) {

        carCounter++;

        let carName = car.name != undefined ? car.name : "";
        let carCodesArray = [];
        let carCodesNamesArray = [];

        for (const [carCode, carCodeNames] of Object.entries(car.codes)) {
            carCodesArray.push(carCode);

            if (typeof carCodeNames === 'string')
                carCodesNamesArray.push(carCodeNames)
            else
                carCodesNamesArray.push(carCodeNames.join(", "))
        }

        toRender += printSearchResultElement(carId, carName, carCodesArray.join(", "), carCodesNamesArray.join(", "))
    }

    searchList.innerHTML = toRender;
    renderingDetails.innerHTML = `Showing ${carCounter} cars`;
}

const renderCarInfo = (data, carId) => {
    console.log("Rendering car infoscreen ...");

    selectedInfo.style.display = "block";
    searchList.style.display = "none";
    renderingDetails.innerHTML = ``;

    if (data.error) {
        selectedInfo.innerHTML = `
        <div style="display: block; text-align: center;">
            <h1>Failed to load page:</h1> 
            <h5>${data.error}</h5>
        </div>`
        return;
    }

    selectedInfo.innerHTML = `<span class="selTitle">cars/<span class="selType">${carId}</span>.yml</span>`;

    const addField = (field, value) => selectedInfo.innerHTML += `<span class="field">${field}<span class="fieldValue">${value}</span></span>`
    const addTreeField = (field, value, depth) => selectedInfo.innerHTML += `<span class="field" data-depth="${depth}">${field}<span class="fieldValue">${value}</span></span>`

    if (data.names)
        addField("Name: ", data.names.join(", "));

    selectedInfo.innerHTML += `<span class="fieldTitle">Codes:</span>`;

    for (const [keyCode, code] of Object.entries(data.codes)) {

        const keyCodeStr = " -> " + keyCode + ": ";

        if (typeof code === 'string')
            addField(keyCodeStr, code)
        else
            addField(keyCodeStr, code.join(", "));
    }
    
    selectedInfo.innerHTML += `<span class="fieldTitle">Versions:</span>`;

    let counter = 0;

    for(const versionKey of Object.keys(data.versions)) {

        counter++;
        const version = data.versions[versionKey]

        addTreeField("-> Version ", counter, 0);
        addTreeField("-> Name: ", versionKey, 1);
        addTreeField("-> Architecture: ", `<a class="fieldLink" href="/architectures?arch=${version.architecture}">${version.architecture}</a>`, 1); // TODO: Link
        
        if(!version.nodes) continue;
       
        addTreeField("-> Nodes: ", "", 1);
       
        for(const [ nodeKey, ecuList] of Object.entries(version.nodes)) {

            addTreeField("-> ", nodeKey, 2);

            for(const ecuOnNode of ecuList) 
                addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${version.architecture}&node=${ecuOnNode}">${ecuOnNode}</a>`, 3); // TODO: Link
        }
    }

    renderingDetails.innerHTML = `Showing car ${carId}`;
}

/**
 * 
 * @param {HTMLDivElement} element 
 */
const onCarClick = (element) => {

    const carId = element.getAttribute("data-car");

    if (!carId) return;

    history.pushState(null, null, location.origin + "/cars?car=" + carId);

    onLoad();
}

const onLoad = () => {
    const urlParams = new URLSearchParams(location.search);

    const carParam = urlParams.get("car");

    console.log("Loading page ...");

    if (!carParam) {
        requestJSON("GET", "/api/v1/cars").then(renderCarListFromData)
        return;
    }

    requestJSON("GET", "/api/v1/car/" + carParam).then((a) => renderCarInfo(a, carParam));
}

search.addEventListener("keyup", () => {

    if (search.value.length < 1) {
        onLoad();
        return;
    }
    
    requestJSONWithBody("POST", "/api/v1/cars/search", {
        query: search.value
    }).then((data) => {
        renderCarListFromData(data);
    })
    
})

onLoad();

window.addEventListener('popstate', onLoad, false);