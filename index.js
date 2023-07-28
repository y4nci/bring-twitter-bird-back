const IMAGES_DIRECTORY = 'images/';
const LOGO_COMPONENT_QUERY_SELECTOR = 'a[aria-label="Twitter"][href="/home"]';

let logoComponent = null;
let logoURL = null;

const isTwitterUrl = (url) => {
    const regex = /https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/;
    return regex.test(url);
};

const getLogoURL = () => {
    return chrome.runtime.getURL(`${IMAGES_DIRECTORY}twitter_logo.svg`);
};

const replaceXWithLogo = () => {
    const logo = document.createElement('img');

    logo.src = logoURL;
    logo.alt = 'Twitter';
    logo.style.width = '30px';
    logo.style.height = '30px';
    logo.style.margin = '10px';

    logoComponent.innerHTML = '';
    logoComponent.appendChild(logo);
};

/**
 * thanks to Yong Wang for their answer on StackOverflow
 * https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 */
const waitForLogoComponent = () => {
    return new Promise(resolve => {
        if (document.querySelector(LOGO_COMPONENT_QUERY_SELECTOR)) {
            return resolve(document.querySelector(LOGO_COMPONENT_QUERY_SELECTOR));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(LOGO_COMPONENT_QUERY_SELECTOR)) {
                resolve(document.querySelector(LOGO_COMPONENT_QUERY_SELECTOR));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

const main = () => {
    const pageAddress = window.location.href;

    if (!isTwitterUrl(pageAddress)) {
        return;
    }

    waitForLogoComponent().then(elem => {
        logoComponent = elem;
        logoURL = getLogoURL();
        replaceXWithLogo();
    });
};

main();
