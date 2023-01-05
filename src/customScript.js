
export function trigger(target) {

    const bodyElement = document.getElementsByTagName('body')[0];
    const div = document.createElement('div')
    div.id = 'test-div';
    div.dataset.token = 'sight';
    div.dataset.buttonid = target;
    bodyElement.append(div);

    const linkTag = document.createElement("link")
    linkTag.href = 'https://iassist-dev.bydata.com/scripts/sight/docs/index.js';
    linkTag.rel = "stylesheet";
    linkTag.id = "iassist-css";
    bodyElement.append(linkTag);

    const scriptTag = document.createElement("script")
    scriptTag.id = "iassist-html";
    scriptTag.src = 'https://iassist-dev.bydata.com/scripts/sight/docs/index.css';
    bodyElement.append(scriptTag);

}
