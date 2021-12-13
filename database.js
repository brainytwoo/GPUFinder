
const productSchema = {
    version: 0,
    title: 'Product Schema',
    description: 'Product info',
    primaryKey: {
        key: 'id',
        fields: [
            'brand',
            'chipset',
            'title'
        ],
        separator: '|'
    },
    type: 'object',
    properties: {
        id: { type: 'string' },
        thumbnail: { type: 'string', default: 'src/media/GpuChip2.png' },
        title: { type: 'string' },
        chipset: { type: 'string' },
        brand: { type: 'string' },
        price: { type: 'number' },
        sources: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    href: { type: 'string' },
                    title: { type: 'string' },
                    history: {
                        type: 'array',
                        items: {
                            price: { type: 'number' },
                            timestamp: { type: 'number', final: true }
                        }
                    }
                }
            }
        }
    },

    required: [
        'id',
        'brand',
        'chipset',
        'title'
    ]
}

let _getDatabase; // cached
function getDatabase(name) {

    return _getDatabase;
}

async function createDatabase(name) {
    const db = null;

    return db;
}

module.exports = {
    getDatabase,
    productSchema
};