const IMAGES_DIRECTORY = 'images/';
const LOGO_COMPONENT_QUERY_SELECTOR = 'a[aria-label="Twitter"][href="/home"]';
const TAB_LOGO_QUERY_SELECTOR = 'head>link[rel="shortcut icon"]';
const TITLE_QUERY_SELECTOR = 'head>title';

let titleComponent = null;
let logoComponent = null;
let logoURL = null;

const isTwitterUrl = (url) => {
    const regex = /https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/;
    return regex.test(url);
};

const getLogoURL = () => {
    return chrome.runtime.getURL(`${IMAGES_DIRECTORY}twitter_logo.svg`);
};

const replaceXWithTwitter = () => {
    let title = titleComponent.innerHTML;

    if (title === 'X') {
        title = 'Twitter';
    } else {
        const regex = /\/ X$/;
        title = title.replace(regex, "/ Twitter");
    }

    titleComponent.innerHTML = title;
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
const waitForComponent = (selector) => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
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

    console.log('Bringing the good ol\' bird back!');

    logoURL = getLogoURL();

    waitForComponent(TITLE_QUERY_SELECTOR).then(elem => {
        titleComponent = elem;
        replaceXWithTwitter();
    });

    waitForComponent(TAB_LOGO_QUERY_SELECTOR).then(elem => {
        elem.href = logoURL;
    });

    waitForComponent(LOGO_COMPONENT_QUERY_SELECTOR).then(elem => {
        logoComponent = elem;
        replaceXWithLogo();
    });
};

setTimeout(main, 500);

window.addEventListener('load', () => setTimeout(main, 500));
