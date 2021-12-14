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
addGpuModal_Link_continue.onclick = submitLink;

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

let selectedProducInfo = 'thumbnail';

const productInfoEnum = {
    'title': 0,
    'brand': 1,
    'chipset': 2,
    'price': 3,
    'thumbnail': 4
}

function xpathsViewTransitionManager(event) {
    // reset everything to default
    for (let i = 0; i < productInfoSelectorInfoInputs.length; i++) {
        productInfoSelectorInfoInputs[i].classList.remove('bg-success');
        productInfoSelectorInfoInputs[i].disabled = true;
        
        if (productInfoSelectorInfoInputs[i].attributes.data_complete.value == 'false') {
            productInfoSelectorInfoInputs[i].classList.add('placeholder');
            productInfoSelectorInfoInputs[i].parentElement.classList.add('placeholder-wave');
        }
    };

    productInfoSelectorInfoThumbnail.classList.remove('border', 'border-success', 'border-4');
    if (productInfoSelectorInfoThumbnail.attributes.data_complete.value == 'false') {
        productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x365/5A6978?text=+';
    }

    // update selected product info index
    selectedProducInfo = event.target.attributes.data_select.value;

    // apply selection styles to specific elements
    const targetIndex = productInfoEnum[event.target.attributes.data_select.value];

    if (targetIndex !== 4) {
        productInfoSelectorInfoInputs[targetIndex].classList.add('bg-success');
        productInfoSelectorInfoInputs[targetIndex].classList.remove('placeholder');
        productInfoSelectorInfoInputs[targetIndex].parentElement.classList.remove('placeholder-wave');
        productInfoSelectorInfoInputs[targetIndex].disabled = false;
    } else { 
        productInfoSelectorInfoThumbnail.classList.add('border', 'border-success', 'border-4');

        if (productInfoSelectorInfoThumbnail.attributes.data_complete.value == 'false')
            productInfoSelectorInfoThumbnail.src = 'https://via.placeholder.com/365x365/2aa198?text=+';
    }
}
for (const element of productInfoSelectorRadioInputs) {
    element.onclick = xpathsViewTransitionManager;
}

// Listen for XPaths
ipcRenderer.on('xpath', (event, xpath, inner) => {

    console.log(inner);

    const targetIndex = productInfoEnum[selectedProducInfo];
    
    if ( targetIndex !== 4) {
        productInfoSelectorInfoInputs[targetIndex].attributes.data_complete.value = 'true';
        productInfoSelectorInfoInputs[targetIndex].value = inner.trim();
        productInfoSelectorInfoInputs[targetIndex].classList.add('form-control-transparent');
    } else {
        productInfoSelectorInfoThumbnail.src = inner;
        productInfoSelectorInfoThumbnail.attributes.data_complete.value = 'true';
    }
});

function dtPrice(data) {
    const cPrice = data.lowest();
    const pPrice = data.prevLowest();

    console.log(`Current ${cPrice} - ${pPrice} Previous`)

    if (cPrice < pPrice) 
        return `<td class="text-success">$${cPrice}</td>`;
    else if (cPrice > pPrice)
        return `<td class="text-danger">$${cPrice}</td>`;
    else
        return `<td>$${cPrice}</td>`;
}

function dataToTable(table, data, index) {
    table.getElementsByTagName('tbody')[0].insertAdjacentHTML('afterbegin', 
    `<tr data-index=${index} onclick="viewProduct(${index})">
        <th class="text-primary text-end fs-3 py-0 mx-2" scope="row"><img src="${data.thumbnail}" style="max-height: 35px;"></th>
        <td>${data.title}</td>
        <td>${data.brand}</td>
        <td>${data.chipset}</td>
        ${dtPrice(data)}
    </tr>`);
}

function viewProduct(index) {
    console.log(productData[index]);

    const product = productData[index];

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalLabel = document.getElementById('productModalLabel');
    const productInfo = document.getElementById('productInfo');

    productModalLabel.innerHTML = product.title;

    productInfo.innerHTML = 
    `<tr>
        <th class="text-primary text-end fs-3 py-0 mx-2" scope="row"><img src="${product.thumbnail}" style="max-height: 35px;"></th>
        <td>${product.title}</td>
        <td>${product.brand}</td>
        <td>${product.chipset}</td>
        ${dtPrice(product)}
    </tr>`;

    productModal.show();
}

function initDataTable() {
    const productTable = document.getElementById('products');

    for (const product in productData) {
        if (Object.hasOwnProperty.call(productData, product)) {
            const element = productData[product];
            
            dataToTable(productTable, element, product)
        }
    }

    let input = document.getElementById('productsSearch');
    let timeout = null;

    input.addEventListener('keyup', function (e) {
        clearTimeout(timeout);

        if (e.code === "Enter")
            searchTable(productTable, input.value);
        else
            timeout = setTimeout(function () {
                searchTable(productTable, input.value);
            }, 1000);
    });

    document.getElementById('searchButton').onclick = () => {
        searchTable(productTable, input.value);
    };
}
initDataTable();

async function searchTable(table, value) {
    console.log('Search Value:' + value);

    value.trim().toLowerCase();

    $(document.getElementById('products').getElementsByTagName('tbody')[0].getElementsByTagName('tr')).filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
}

function addProduct() {
    const productTable = document.getElementById('products');
    const inputs = document.getElementById('addGpuOffCanvas_XPathElementSelection').getElementsByTagName('input');

    const source = new Source('Unknown', addGpuModal_Link_input.value);
    source.newPrice(parseFloat((inputs[3].value).replace(/[^0-9.]/, '')));

    const product = new Product(undefined, inputs[0].value, inputs[1].value, inputs[2].value);
    product.addSource(source);

    productData.push(product);

    dataToTable(productTable, product, productData.length - 1);

    addGpuOffCanvas_XPaths.hide();
}
document.getElementById('newSourceSubmit').onclick = addProduct;

// temp open xpaths canvas upon loading for dev purposes
// ipcRenderer.invoke('loadURL', 'https://www.amazon.com/ZOTAC-GeForce-Graphics-IceStorm-ZT-A30600H-10M/dp/B08W8DGK3X/ref=sr_1_4?keywords=3060&qid=1639014780&sr=8-4');
// addGpuOffCanvas_XPaths.show();