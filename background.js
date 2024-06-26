let tabID = null;


const main = () => {
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
    };

    const logoURL = chrome.runtime.getURL('images/twitter_logo.svg');

    waitForComponent('head>title').then(elem => {
        const titleComponent = elem;
        let title = titleComponent.innerHTML;

        if (title === 'X') {
            title = 'Twitter';
        } else {
            const regex = /\/ X$/;
            title = title.replace(regex, "/ Twitter");
        }

        titleComponent.innerHTML = title;
    });

    waitForComponent('head>link[rel="shortcut icon"]').then(elem => {
        elem.href = logoURL;
    });

    waitForComponent('h1[role="heading"] > a').then(elem => {
        const logoComponent = elem;

        if (logoComponent.firstChild.getAttribute('src') === logoURL) return;

        const logo = document.createElement('img');

        logo.src = logoURL;
        logo.alt = 'Twitter';
        logo.style.width = '30px';
        logo.style.height = '30px';
        logo.style.margin = '10px';

        logoComponent.innerHTML = '';
        logoComponent.appendChild(logo);
    });
};

const isTwitterOrXUrl = (url) => {
    const regex = /https:\/\/(x|twitter)\.com\/.*/;
    return regex.test(url);
};

const injectScript = (func=main) => chrome.scripting.executeScript({
    target: {
        tabId: tabID,
        allFrames: true
    },
    function: func
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    tabID = tabId;

    if (isTwitterOrXUrl(tab.url) && changeInfo.status === 'complete') {
        await injectScript(main);
    }
});
