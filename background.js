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

    console.log('Bringing the good ol\' bird back!');

    const logoURL = chrome.runtime.getURL('images/twitter_logo.svg');

    waitForComponent('head>title').then(elem => {
        const titleComponent = elem;
        console.log(titleComponent);
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
        console.log(elem);
        elem.href = logoURL;
    });

    waitForComponent('a[aria-label="Twitter"][href="/home"]').then(elem => {
        const logoComponent = elem;
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

const isChromeUrl = (url) => {
    return url.startsWith('chrome://');
};

const getCurrentTab = async() => {
    let queryOptions = { active: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);

    if (!tab) {
        console.error('no active tab found');
        return;
    }

    return tab;
}

const injectScript = (func=main) => chrome.scripting.executeScript({
    target: {
        tabId: tabID,
        allFrames: true
    },
    function: func
});

const background = async () => {
    const currentTab = await getCurrentTab();
    if (!tabID) tabID = currentTab.id;

    console.log(currentTab);

    if (isChromeUrl(currentTab.url)) {
        return;
    }

    injectScript();
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    console.log('we up listenin stuff');

    tabID = tabId;

    if (isChromeUrl(tab.url)) {
        return;
    }
    if (tab.active && changeInfo.status === 'complete') {
        console.log('we injectin');
        await injectScript(main);
    }
});

