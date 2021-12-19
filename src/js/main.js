const { map } = require("jquery");

// Window controls
function minimizeWindow () { ipcRenderer.invoke('windowAction', 1) }
function maximizeWindow () { ipcRenderer.invoke('windowAction', 2) }
function closeWindow () { ipcRenderer.invoke('windowAction', 3) }

// database thingy
const localdb = new Store();
// Global data
let productData = localdb.get('products');

// Add Gpu Stuffs
const addGpuModal_Link = new bootstrap.Modal(document.getElementById('addGpuModal_Link'));
const addGpuOffCanvas_XPaths_el = document.getElementById('addGpuOffCanvas_XPaths');
const addGpuOffCanvas_XPaths = new bootstrap.Offcanvas(addGpuOffCanvas_XPaths_el);

const addGpuModal_Link_input = document.getElementById('addGpuModal_Link_input');
const addGpuModal_Link_continue = document.getElementById('addGpuModal_Link_continue')

// Price range slider
const pricefilter = document.getElementById('pricefilter');

// Product price history chart
const phChart = new Chart("productModalChart", {
    type: 'line',
    data: null
});
const colors = ['#779ECC', '#FFB347', '#F2C894', '#9FC0DE', '#FF985A'];

// show notification
function notify(type) {
    if (type === 'example') {
        new bootstrap.Toast(document.getElementById('alertToast')).show()
        new Notification('Example Alert', { body: 'This would notify you of prices or such based on the alert that went off' })
            .onclick = () => document.getElementById("output").innerText = 'Close'
    }
}

function waitfordata() {
    let timeout = null;
    if (productData[0]) {
        clearTimeout(timeout);
        console.log('Got Data', productData)
        productData = deserializeProducts(productData);
        setupDataTable();
    } else {
        console.log('Waiting for Data', productData);
        timeout = setTimeout(waitfordata, 1000);
    }
}

function deserializeProducts(sProducts) {
    console.log(sProducts);

    let dsProducts = [];

    for (const product of sProducts) {

        const dsSources = product.sources.map( source => {
            return new Source(
                source.title,
                source.href,
                source.priceXPath,
                source.history
            );
        });

        const dsProduct = new Product(
            product.thumbnail,
            product.title,
            product.brand,
            product.chipset,
            dsSources
        );

        dsProducts.push(dsProduct);
    }

    console.log(dsProducts);

    return dsProducts;
}

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
    'label': 4,
    'thumbnail': 5
}

function xpathsViewStyleManager(event) {
    for (const element of productInfoSelectorInfoInputs) {
        if (element.value.length > 0) element.attributes.data_complete.value = 'true';
    }
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

    if (targetIndex !== 5) {
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

// Listen for XPaths
ipcRenderer.on('xpath', (event, xpath, inner) => {

    console.log(inner);

    const targetIndex = productInfoEnum[selectedProducInfo];
    
    if ( targetIndex === 3 ) {
        productInfoSelectorInfoInputs[targetIndex].attributes.data_xpath.value = xpath;
    }

    if ( targetIndex !== 5) {
        productInfoSelectorInfoInputs[targetIndex].attributes.data_complete.value = 'true';
        productInfoSelectorInfoInputs[targetIndex].value = inner.trim();
        productInfoSelectorInfoInputs[targetIndex].classList.add('form-control-transparent');
    } else {
        productInfoSelectorInfoThumbnail.src = inner;
        productInfoSelectorInfoThumbnail.attributes.data_complete.value = 'true';
    }
});

// Price range slider stuffs
const priceRangeSlider = new Rangeable(pricefilter, {
    type: 'double',
    min: 0,
    max: 20000,
    step: 5,
    value: [0, 20000],
    tooltips: false,
    onInit: setDisplay,
    onChange: setDisplay,
});

function setDisplay(values) {
    const pricefilterMax = document.getElementById('pricefilterMax');
    const pricefilterMin = document.getElementById('pricefilterMin');

    pricefilterMax.textContent = `$${values[0]}`;
    pricefilterMin.textContent = `$${values[1]}`;
}

async function filterGroupManager(filterContainer) {
    const filterOptions = filterContainer.getElementsByTagName('input');

    filterOptions[0].onchange = function allOnChange() { ifAllSelectAll(filterOptions); };

    for (let index = 1; index < filterOptions.length; index++) {
        filterOptions[index].onchange = function oneOnChange() {
            if (!this.checked)
                filterOptions[0].checked = false;
        }
    }
}

async function ifAllSelectAll(inputs) {
    if (inputs[0].checked) {
        for (const input of inputs)
            input.checked = true;
        return true;
    }
    return false;
}

// Product table stuffs
function viewProduct(index) {
    console.log(productData[index]);

    const product = productData[index];

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalLabel = document.getElementById('productModalLabel');
    const productModalThumbnail = document.getElementById('productModalThumbnail');
    const productModalInfoList = document.getElementById('productModalInfoList');
    const productModalSources = document.getElementById('productModalSources');

    productModalLabel.innerHTML = product.title;

    productModalThumbnail.src = product.thumbnail;

    productModalInfoList.innerHTML = `
                <li class="list-group-item"><span class="text-muted">Name: </span>${product.title}</li>
                <li class="list-group-item"><span class="text-muted">Brand: </span>${product.brand}</li>
                <li class="list-group-item"><span class="text-muted">Chipset: </span>${product.chipset}</li>
                <li class="list-group-item"><span class="text-muted">List Price: </span>${dtPrice(product).replace('td', 'span')}</li>`;

    productModalSources.innerHTML = product.sources.map(source => `
                <li class="list-group-item">
                    <button onclick='shell.openExternal("${source.href}");' class="btn btn-primary btn-sm">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                &ensp;&ensp;${source.title}</li>`).join('');

    let datasets = [];

    for (const source of product.sources) {
        const trackDate = new Date();
        const color = colors[product.sources.indexOf(source)];
        let dataset = { label: source.title, backgroundColor: color, borderColor: color, data: [] };
        for (let i = 0; i < 12; i++) {
            const element = source.history[i];
            if (element)
                dataset.data.push({ x: element.timestamp, y: element.price });
            else 
                dataset.data.unshift({ x: trackDate, y: 0 });
        }

        datasets.push(dataset);
        trackDate.setMonth(trackDate.getMonth() - 1)
    }

    console.log(datasets);

    let currentDateTime = new Date();
    const max = currentDateTime.getTime();
    const min = currentDateTime.setMonth(currentDateTime.getMonth() - 12);

    const data = {
        labels: moment.monthsShort(),
        datasets: datasets,
        options: {
            scales: {
                x: {
                    min: min,
                    max: max
                }
            }
        }
    };

    phChart.data = data;
    phChart.update();

    productModal.show();
}

// product table stuffs 
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
        <th class="text-primary text-end fs-3 pt-0 pb-2 mx-2" scope="row"><img src="${data.thumbnail}" style="max-height: 35px;"></th>
        <td>${data.title}</td>
        <td>${data.brand}</td>
        <td>${data.chipset}</td>
        ${dtPrice(data)}
    </tr>`);

    dataToFilters(table, data, index, document.getElementById('brandfilterContainer'));
    dataToFilters(table, data, index, document.getElementById('chipsetfilterContainer'));
}

async function dataToFilters(table, data, index, container) {
    let filters = container.getElementsByTagName('input');

    const elementData = container.id === 'brandfilterContainer' ? data.brand : data.chipset;

    for (const filter of filters) {
        if (filter.attributes['data-filter'].value.toLowerCase() === elementData.toLowerCase()) {
            return false;
        }
    }

    filters[filters.length - 1].parentElement.insertAdjacentHTML('afterend',
        `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="" data-filter="${elementData}" checked>
            <label class="form-check-label">${elementData}</label>
        </div>`);

    filterGroupManager(container);
}

async function refreshDataTable() {
    const productTable = document.getElementById('products');

    productTable.getElementsByTagName('tbody')[0].innerHTML = '';

    for (const product in productData) {
        if (Object.hasOwnProperty.call(productData, product)) {
            const element = productData[product];
            dataToTable(productTable, element, product);
        }
    }
}

function setupDataTable() {
    const productTable = document.getElementById('products');

    refreshDataTable();

    const input = document.getElementById('productsSearch');
    let timeout = null;

    input.addEventListener('keyup', function (e) {
        clearTimeout(timeout);

        if (e.code === "Enter")
            applyFilters();
        else
            timeout = setTimeout(function () {
                applyFilters();
            }, 1000);
    });

    document.getElementById('searchButton').onclick = applyFilters;

    for (const element of document.getElementsByName('applyFilters'))
        element.onclick = applyFilters;   

    function applyFilters() {
        const brandFilterOptions = document.getElementById('brandfilterContainer').getElementsByTagName('input');
        const chipsetFilterOptions = document.getElementById('chipsetfilterContainer').getElementsByTagName('input');

        const nameFilters = document.getElementById('productsSearch').value;

        const priceFilters = priceRangeSlider.getValue();

        let brandFilters = []
        let chipsetFilters = [];

        const allBrands = brandFilterOptions[0].checked;
        const allChipsets = chipsetFilterOptions[0].checked;

        for (let index = 1; index < brandFilterOptions.length; index++) {
            const filter = brandFilterOptions[index];
            if (allBrands || filter.checked)
                brandFilters.push(filter.attributes['data-filter'].value);
        }

        for (let index = 1; index < chipsetFilterOptions.length; index++) {
            const filter = chipsetFilterOptions[index];
            if (allChipsets || filter.checked)
                chipsetFilters.push(filter.attributes['data-filter'].value);
        }

        filterTable(productTable, nameFilters, priceFilters, brandFilters, chipsetFilters);
    }
}

async function filterTable(table, names = '', price = [0, 20000], brands = [], chipsets = []) {
    console.log(`Filtering table... ${table.id}`)
    console.log(`Names: ${names}\nBrands: ${brands.toString()}\nChipsets: ${chipsets.toString()}\nPrice: ${price.toString()}`);

    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    $(rows).show();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const cells = row.getElementsByTagName('td');

        if (!(cells[0].innerText.clean().includes(names.clean()))) {
            $(row).hide();
            continue;
        }
        
        if (!brands.some(substring => cells[1].innerText.clean().includes(substring.clean()))) {
            $(row).hide();
            continue;
        }

        if (!chipsets.some(substring => cells[2].innerText.clean().includes(substring.clean()))) {
            $(row).hide();
            continue;
        }

        const setprice = parseFloat(cells[3].innerText.clean());
        if (!(setprice >= price[0] && setprice <= price[1])) {
            $(row).hide();
            continue;
        }
    }
}

// add products and sources stuffs
function addProductOrSource() {
    const productTable = document.getElementById('products');
    const inputs = document.getElementById('addGpuOffCanvas_XPathElementSelection').getElementsByTagName('input');

    const sourceTitle = inputs[4].value;
    const sourceHref = addGpuModal_Link_input.value;
    const sourcePriceXpath = inputs[3].attributes.data_xpath.value;
    const sourcePrice = parseFloat((inputs[3].value).clean());

    const productThumbnail = undefined;
    const productTitle = inputs[0].value;
    const productBrand = inputs[1].value;
    const productChipset = inputs[2].value;

    const source = new Source(sourceTitle, sourceHref, sourcePriceXpath);
    source.newPrice(sourcePrice);

    const product = new Product(productThumbnail, productTitle, productBrand, productChipset);
    product.addSource(source);

    console.log(product);

    console.log('Checking if product already exists...')
    if (productData.some(el => el.title.toLowerCase() === productTitle.toLowerCase())) {
        // product exists
        console.log('Product already exists');
        // check if source exists for product
        console.log('Checking if source already exists...');
        if (productData.some(el => (el.sources.some(source => source.href.toLowerCase() === sourceHref.toLowerCase())))) {
            // source already exists
            console.log('Source already exists')
            // notice that nothing was done
            console.warn('No new products or sources added');
        } else {
            // source does not exist
            console.log('Source does not exist');
            // add new source ot the product
            console.log('Adding new source to product...');
            productData.find(el => el.title.toLowerCase() === productTitle.toLowerCase()).addSource(source);
            refreshDataTable();
            console.log('Added new source to product');
        }
    } else {
        // product does not exist
        console.log('Product does not exist');
        // add new product and its source
        console.log('Adding new product and its source...');
        productData.push(product);
        dataToTable(productTable, product, productData.length - 1);
        console.log('Added new product and its source');
    }

    localdb.set('products', productData);

    addGpuOffCanvas_XPaths.hide();
}

// Stuff to setup after everything is loaded
addGpuModal_Link_continue.onclick = submitLink;
for (const element of productInfoSelectorRadioInputs) {
    element.onclick = xpathsViewTransitionManager;
    element.onchange = xpathsViewStyleManager;
}
// Remove invalid visuals from new gpu modal input when user re-selects it
addGpuModal_Link_input.addEventListener('focus', (event) => {
    addGpuModal_Link_input.classList.remove('is-invalid');
});
// Notify backend to close second browserview when user exits gpu info offcanvas
addGpuOffCanvas_XPaths_el.addEventListener('hide.bs.offcanvas', (event) => {
    ipcRenderer.send('closeProductView');
    addGpuModal_Link_input.value = "";
});
document.getElementById('newSourceSubmit').onclick = addProductOrSource;
waitfordata();

// function addProduct(product) {
//     const productTable = document.getElementById('products');

//     productData.push(product);

//     dataToTable(productTable, product, productData.length - 1);
// }

// // Filler data
// function toFixed(num, fixed) {
//     var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
//     return num.toString().match(re)[0];
// }

// function rand(min, max, decimal) {
//     if (!decimal)
//         return Math.floor((Math.random() * max) + min);
//     else
//         return toFixed((Math.random() * max) + min, decimal);
// }

// // filler data to make things look good
// const title = ['EVGA XC GAMING', 'Asus DUAL EVO OC', 'Asus TUF GAMING OC', 'NVIDIA Founders Edition', 'Asus ROG STRIX WHITE OC', 'MSI VENTUS 2X'];
// const brand = ['Nvidia', 'Asus', 'EVGA', 'Zotac', 'MSI', 'Gigabyte', 'VisionTek', 'ASRock', 'Sapphire'];
// const chipset = ['GeForce RTX 3060', 'GeForce GTX 1050 Ti', 'GeForce RTX 3060 Ti', 'GeForce GTX 1650 G5', 'GeForce GTX 1660 SUPER', 'GeForce RTX 3070'];

// for (let index = 0; index < 100; index++) {
//     let product = new Product(undefined, title[rand(0, 5)], brand[rand(0, 8)], chipset[rand(0, 5)]);
//     let source = new Source('Amazon', 'https://www.amazon.com/ZOTAC-GeForce-192-bit-Graphics-ZT-T20600H-10M/dp/B07TDN1SC5/ref=dp_fod_2?pd_rd_i=B07TDN1SC5&th=1');

//     source.newPrice(rand(100, 1000, 2));
//     source.newPrice(rand(200, 900, 2));
//     product.addSource(source);

//     addProduct(product);
// }

// temp open xpaths canvas upon loading for dev purposes
// ipcRenderer.invoke('loadURL', 'https://www.amazon.com/ZOTAC-GeForce-Graphics-IceStorm-ZT-A30600H-10M/dp/B08W8DGK3X/ref=sr_1_4?keywords=3060&qid=1639014780&sr=8-4');
// addGpuOffCanvas_XPaths.show();

// const table = document.getElementById('products');
// const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
// const row = rows[0];
// const cells = row.getElementsByTagName('td');

// const loginModal = new bootstrap.Modal(document.getElementById('loginModal'), { keyboard: false });
// loginModal.show();

// const addGpuModal_Link = new bootstrap.Modal(document.getElementById('addGpuModal_Link'));
// addGpuModal_Link.show();

// const addGpuOffCanvas_XPaths = new bootstrap.Offcanvas(addGpuOffCanvas_XPaths_el);
// addGpuOffCanvas_XPaths.show();

// const productModal = new bootstrap.Modal(document.getElementById('productModal'));
// productModal.show();

// const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
// alertModal.show();