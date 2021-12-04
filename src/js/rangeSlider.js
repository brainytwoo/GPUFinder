
const pricefilter = document.getElementById('pricefilter');

const slider = new Rangeable(pricefilter, {
    type: 'double',
    min: 0,
    max: 5000,
    step: 5,
    value: [0, 5000],
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


