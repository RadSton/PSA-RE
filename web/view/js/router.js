import Registry from "../page/Registry.js";

const route = () => {

    let currentPageEle = undefined;

    for (const registeredPage of Registry) {

        if (!registeredPage.path.toLowerCase().includes(location.pathname.toLowerCase()))
            continue;

        currentPageEle = registeredPage;

        break;
    }

    if (!currentPageEle) {
        // TODO: show 404
        // for now just a redirect 
        history.pushState(null, null, location.origin + "/architecture");
        currentPageEle = Registry[0];
    }


    const currentPage = new currentPageEle.page();
    Object.defineProperty(window, "currentPage", { value: currentPage, configurable: true });
}

Object.defineProperty(window, "route", { value: route });
route();

const handleAElementClick = (event) => {
    const fullLink = event.target.href;
    history.pushState(null, null, fullLink);
    event.preventDefault();

    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1); // set Timeout is just so that it runs async seems to block thread otherwise

    route();
}

document.querySelectorAll(".headerLink").forEach((ele) => {
    ele.addEventListener("click", handleAElementClick)
})

document.addEventListener("click", (event) => {
    if (!event.target.matches(".fieldLink") && !event.target.matches(".headerLink ")) return;
    handleAElementClick(event);
})