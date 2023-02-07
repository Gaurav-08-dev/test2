
export function trigger(target) {

    const bodyElement = document.getElementsByTagName('body')[0];
    const div = document.createElement('div')
    div.id = 'test-div';
    div.dataset.token = 'sight';
    div.dataset.buttonid = 'btn';
    bodyElement.append(div);

    // const linkTag = document.createElement("link")
    // linkTag.href = 'https://gaurav-08-dev.github.io/test2/index.css';
    // linkTag.rel = "stylesheet";
    // linkTag.id = "iassist-css";
    // bodyElement.append(linkTag);

    const scriptTag = document.createElement("script")
    scriptTag.id = "iassist-html";
    scriptTag.src = 'https://gaurav-08-dev.github.io/test2/index.js';
    bodyElement.append(scriptTag);

}
