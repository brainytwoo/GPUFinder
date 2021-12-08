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

    for (let i = 0; i < productInfoSelectorInfoInputs.length; i++) {
        productInfoSelectorInfoInputs[i].classList.remove('bg-success');
        productInfoSelectorInfoInputs[i].disabled = true;
    };

    productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x150/5A6978?text=+';

    switch (event.target.attributes.data_select.value) {
        case 'title':
            productInfoSelectorInfoInputs[0].classList.add('bg-success');
            productInfoSelectorInfoInputs[0].disabled = false;
            break;
        case 'brand':
            productInfoSelectorInfoInputs[1].classList.add('bg-success');
            productInfoSelectorInfoInputs[1].disabled = false;
            break;
        case 'chipset':
            productInfoSelectorInfoInputs[2].classList.add('bg-success');
            productInfoSelectorInfoInputs[2].disabled = false;
            break;
        case 'price':
            productInfoSelectorInfoInputs[3].classList.add('bg-success');
            productInfoSelectorInfoInputs[3].disabled = false;
            break;
        case 'thumbnail':
            productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x150/1F6660?text=+';
            break;
    }
}
for (const element of productInfoSelectorRadioInputs) {
    element.onclick = xpathsViewTransitionManager;
}

// temp open xpaths canvas upon loading for dev purposes
addGpuOffCanvas_XPaths.show();