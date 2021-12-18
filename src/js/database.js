function Product(thumbnail, title, brand, chipset, sources) {
    this.thumbnail = thumbnail ? thumbnail : '../src/media/GpuChip2.png';
    this.title = title;
    this.brand = brand;
    this.chipset = chipset;
    this.sources = typeof (sources) === 'object' ? sources : [];

    this.addSource = function (source) {
        this.sources.push(source);
    }

    this.prevLowest = function () {
        const current = this.lowest();
        if (this.sources.length > 0) {
            let prevPrice = Number.MAX_SAFE_INTEGER;
            this.sources.forEach( source => {
                let prevSourcePrice = source.history.at(-1).price;

                if (prevSourcePrice === current)
                    if (source.history.length > 1)
                        prevSourcePrice = source.history.at(-2).price;

                if (prevSourcePrice < prevPrice)
                    prevPrice = prevSourcePrice;
            });
            return prevPrice === Number.MAX_SAFE_INTEGER ? current : prevPrice;
        }
        return current;
    }

    this.lowest = function () {
        let price = 0;
        if (this.sources.length > 0) {
            price = Number.MAX_SAFE_INTEGER;
            this.sources.forEach(source => {
                const latestSourcePrice = source.history.at(-1).price;
                if (latestSourcePrice < price)
                    price = latestSourcePrice;
            });
        }
        return price === Number.MAX_SAFE_INTEGER ? 0 : price;
    }
}

function Source (title, href, history) {
    this.title = title;
    this.href = href;
    this.history = typeof (history) === 'object' ? minLength(history) : [].of(12);
    this.priceXPath = undefined;

    this.newPrice = function (price) {
        this.history.push({ 
            price: price,
            timestamp: Date.now()
        });

        if (this.history.length > 12) {
            this.history.shift();
        }
    }

    function minLength(array) {
        while (array.length < 12) {
            array.unshift(0);
        }
        return array;
    }
}