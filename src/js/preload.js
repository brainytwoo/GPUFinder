
const ipcRenderer = require('electron').ipcRenderer;

document.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() == 'img') {
        ipcRenderer.send('xpath', getElementXPath(event.target), event.target.src);
    } else {
        ipcRenderer.send('xpath', getElementXPath(event.target), event.target.innerHTML);
    }
});

function getElementXPath(element) {
    let path = "";

    for (; element && element.nodeType == 1; element = element.parentNode) {
        idx = getElementIdx(element);
        xname = element.tagName;
        if (idx > 1) xname += "[" + idx + "]";
        path = "/" + xname + path;
    }

    return path;
}

function getElementIdx(element) {
    let count = 1;

    for (let sib = element.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeType == 1 && sib.tagName == element.tagName) count++
    }

    return count;
}
