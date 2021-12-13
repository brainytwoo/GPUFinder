function Product(thumbnail, title, brand, chipset, sources ) {
    this.thumbnail = thumbnail ? thumbnail : '../src/media/GpuChip2.png';
    this.title = title;
    this.brand = brand;
    this.chipset = chipset;
    this.sources = typeof (sources) === 'object' ? sources : [];

    // this.thumbnail = function () { return this._thumbnail; }
    // this.title = function () { return this._title; }
    // this.brand = function () { return this._brand; }
    // this.chipset = function () { return this._chipset; }
    // this.sources = function () { return this._sources; }

    this.addSource = function (source) {
        this.sources.push(source);
    }

    this.prevLowest = function () {
        let price = 0;
        if (this.sources.length > 0) {
            const current = this.lowest();
            price = current;
            this.sources.forEach( source => {
                const prevSourcePrice = source.history.at(-1).price;
                if (prevSourcePrice != current && prevSourcePrice < price)
                    price = prevSourcePrice;
            });
        }
        return price;
    }

    this.lowest = function () {
        let price = 0;
        if (this.sources.length > 0) {
            price = Number.MAX_VALUE;
            this.sources.forEach(source => {
                const latestSourcePrice = source.history.at(-1).price;
                if (latestSourcePrice < price)
                    price = latestSourcePrice;
            });
        }
        return price;
    }
}

function Source ( title, href, history ) {
    this.title = title;
    this.href = href;
    this.history = typeof (history) === 'object' ? history : [];

    this.priceChange = function (price) {
        this.history.push({ 
            price: price,
            timestamp: Date.now()
        });
    }
}

function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

function rand(min, max, decimal) {
    if (!decimal)
        return Math.floor((Math.random() * max) + min);
    else 
        return toFixed((Math.random() * max) + min, decimal);
}

// filler data to make things look good
const title = ['EVGA XC GAMING', 'Asus DUAL EVO OC', 'Asus TUF GAMING OC', 'NVIDIA Founders Edition', 'Asus ROG STRIX WHITE OC', 'MSI VENTUS 2X'];
const brand = ['Nvidia', 'Asus', 'EVGA', 'Zotac', 'MSI', 'Gigabyte', 'VisionTek', 'ASRock', 'Sapphire'];
const chipset = ['GeForce RTX 3060', 'GeForce GTX 1050 Ti', 'GeForce RTX 3060 Ti', 'GeForce GTX 1650 G5', 'GeForce GTX 1660 SUPER', 'GeForce RTX 3070'];

let productData = [];

for (let index = 0; index < 100; index++) {
    let product = new Product(undefined, title[rand(0, 5)], brand[rand(0, 8)], chipset[rand(0, 5)]);
    let source = new Source('Amazon', 'https://www.amazon.com/ZOTAC-GeForce-192-bit-Graphics-ZT-T20600H-10M/dp/B07TDN1SC5/ref=dp_fod_2?pd_rd_i=B07TDN1SC5&th=1');

    source.priceChange(rand(100, 1000, 2));
    source.priceChange(rand(100, 1000, 2));
    product.addSource(source);

    productData.push(product);
}