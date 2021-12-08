// const ipcRenderer = require('electron').ipcRenderer;

// Window controls
function minimizeWindow () { ipcRenderer.invoke('windowAction', 1) }
function maximizeWindow () { ipcRenderer.invoke('windowAction', 2) }
function closeWindow () { ipcRenderer.invoke('windowAction', 3) }

// Add Gpu Stuffs
const addGpuModal_Link = new bootstrap.Modal(document.getElementById('addGpuModal_Link'));
const addGpuOffCanvas_XPaths_el = document.getElementById('addGpuOffCanvas_XPaths');
const addGpuOffCanvas_XPaths = new bootstrap.Offcanvas(addGpuOffCanvas_XPaths_el);

const addGpuModal_Link_input = document.getElementById('addGpuModal_Link_input');
const addGpuModal_Link_continue = document.getElementById('addGpuModal_Link_continue')

// Handle link submission from initial new gpu modal
function submitLink() {
    if (addGpuModal_Link_input.value.length > 5) {
        ipcRenderer.invoke('loadURL', addGpuModal_Link_input.value);
        addGpuModal_Link.hide();
        addGpuOffCanvas_XPaths.show();
    } else {
        addGpuModal_Link_input.classList.add('is-invalid');
    }
}
addGpuModal_Link_continue.onclick = submitLink

// Remove invalid visuals from new gpu modal input when user re-selects it
addGpuModal_Link_input.addEventListener('focus', (event) => {
    addGpuModal_Link_input.classList.remove('is-invalid');
});

// Notify backend to close second browserview when user exits gpu info offcanvas
addGpuOffCanvas_XPaths_el.addEventListener('hide.bs.offcanvas', (event) => {
    ipcRenderer.send('closeProductView');
    addGpuModal_Link_input.value = "";
});

// Product info selection stuffs
const productInfoSelectorRadioInputs = document.getElementById('productInfoSelector').getElementsByTagName('input');
const productInfoSelectorRadioLabels = document.getElementById('productInfoSelector').getElementsByTagName('label');

const productInfoSelectorInfoInputs = document.getElementById('addGpuOffCanvas_XPathElementSelection').getElementsByTagName('input');
const productInfoSelectorInfoThumbnail = document.getElementById('productInfoSelectorInfoThumbnail');

function xpathsViewTransitionManager(event) {

    const fakeEnum = {
        'title': 0,
        'brand': 1,
        'chipset': 2,
        'price': 3,
        'thumbnail': 4
    }

    // reset everything to default
    for (let i = 0; i < productInfoSelectorInfoInputs.length; i++) {
        productInfoSelectorInfoInputs[i].classList.remove('bg-success');
        productInfoSelectorInfoInputs[i].classList.add('placeholder');
        productInfoSelectorInfoInputs[i].parentElement.classList.add('placeholder-wave');
        productInfoSelectorInfoInputs[i].disabled = true;
    };

    productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x150/5A6978?text=+';

    // apply selection styles to specific elements
    const targetIndex = fakeEnum[event.target.attributes.data_select.value];

    if (targetIndex !== 4) {
        productInfoSelectorInfoInputs[targetIndex].classList.add('bg-success');
        productInfoSelectorInfoInputs[targetIndex].classList.remove('placeholder');
        productInfoSelectorInfoInputs[targetIndex].parentElement.classList.remove('placeholder-wave');
        productInfoSelectorInfoInputs[targetIndex].disabled = false;
    } else {
        productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x150/2aa198?text=+';
    }


}
for (const element of productInfoSelectorRadioInputs) {
    element.onclick = xpathsViewTransitionManager;
}

// temp open xpaths canvas upon loading for dev purposes
addGpuOffCanvas_XPaths.show();