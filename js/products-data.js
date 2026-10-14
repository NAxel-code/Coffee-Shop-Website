/**
 * MR.COFFEE - MASTER PRODUCTS DATA & POS CATALOG
 * Single Source of Truth for all menu items, taste notes, roastery origins, and categories.
 */

(function () {
    const products = [
        {
            id: 'americano',
            name: 'Americano',
            category: 'espresso',
            categoryLabel: 'Signature Espresso',
            type: 'espresso',
            price: 35000,
            image: 'images/product1.jpeg',
            badge: 'Classic',
            isMostOrdered: true,
            hasMilk: false,
            defaultTemp: 'hot',
            allowedTemps: ['hot', 'iced'],
            origin: 'Gayo & Toraja Arabica',
            roastLevel: 'Medium-Dark Roast',
            notes: 'Rich crema, floral undertones, clean bittersweet finish.',
            description: 'Double shot espresso murni dengan air panas bersuhu presisi. Bold, bersih, dan memancarkan aroma bunga semerbak khas pegunungan.'
        },
        {
            id: 'cappuccino',
            name: 'Cappuccino',
            category: 'espresso',
            categoryLabel: 'Classic Espresso',
            type: 'espresso',
            price: 40000,
            image: 'images/product2.jpeg',
            badge: 'Best Seller',
            isMostOrdered: true,
            hasMilk: true,
            defaultTemp: 'hot',
            allowedTemps: ['hot', 'iced'],
            origin: 'House Blend Arabica',
            roastLevel: 'Medium Roast',
            notes: 'Velvety micro-foam with balanced dark chocolate notes.',
            description: 'Paduan harmonis espresso pekat, steamed milk segar, dan micro-foam selembut sutra dengan taburan bubuk cokelat premium.'
        },
        {
            id: 'caramel-macchiato',
            name: 'Caramel Macchiato',
            category: 'espresso',
            categoryLabel: 'Sweet Indulgence',
            type: 'espresso',
            price: 45000,
            image: 'images/product6.jpeg',
            badge: 'Popular',
            isMostOrdered: true,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['hot', 'iced'],
            origin: 'House Blend Specialty',
            roastLevel: 'Medium-Dark Roast',
            notes: 'Vanilla steamed milk, bold ristretto & artisanal caramel.',
            description: 'Susu segar beraroma vanila Madagaskar, dituangi ristretto pekat berlapis dan sentuhan saus karamel homemade keemasan.'
        },
        {
            id: 'cold-brew',
            name: 'Cold Brew',
            category: 'brewed',
            categoryLabel: 'Slow Dripped',
            type: 'brewed',
            price: 45000,
            image: 'images/product3.jpeg',
            badge: '16h Steeped',
            isMostOrdered: true,
            hasMilk: false,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'Aceh Gayo Wet-Hulled',
            roastLevel: 'Dark Roast',
            notes: 'Steeped 16 hours. Ultra low acidity, bold cacao notes.',
            description: 'Ekstraksi dingin perlahan selama 16 jam tanpa pemanasan. Menghasilkan karakter rasa cokelat hitam tebal dengan keasaman sangat rendah.'
        },
        {
            id: 'v60-pour-over',
            name: 'V60 Pour Over',
            category: 'brewed',
            categoryLabel: 'Manual Brew',
            type: 'brewed',
            price: 40000,
            image: 'images/product 9.jpeg',
            badge: 'Single Origin',
            isMostOrdered: false,
            hasMilk: false,
            defaultTemp: 'hot',
            allowedTemps: ['hot', 'iced'],
            origin: 'Kintamani Natural',
            roastLevel: 'Light-Medium Roast',
            notes: 'Clean body, jasmine aroma, tropical fruit acidity.',
            description: 'Metode seduh manual presisi tinggi. Menghasilkan body yang bersih, aroma melati semerbak, dan keasaman buah tropis yang menyegarkan.'
        },
        {
            id: 'french-press',
            name: 'French Press',
            category: 'brewed',
            categoryLabel: 'Immersion Brew',
            type: 'brewed',
            price: 42000,
            image: 'images/product10.jpeg',
            badge: 'Full Body',
            isMostOrdered: false,
            hasMilk: false,
            defaultTemp: 'hot',
            allowedTemps: ['hot'],
            origin: 'Mandheling Grade 1',
            roastLevel: 'Dark Roast',
            notes: 'Full body, earthy notes, lingering sweet cocoa.',
            description: 'Ekstraksi seduh imersi penuh yang mempertahankan minyak alami biji kopi untuk cita rasa kopi yang tebal, hangat, dan mantap.'
        },
        {
            id: 'matcha-latte',
            name: 'Matcha Latte',
            category: 'noncoffee',
            categoryLabel: 'Artisan Non-Coffee',
            type: 'noncoffee',
            price: 43000,
            image: 'images/product11.jpeg',
            badge: 'Uji Kyoto',
            isMostOrdered: false,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['hot', 'iced'],
            origin: 'Kyoto, Japan',
            roastLevel: 'Ceremonial Grade Matcha',
            notes: 'Ceremonial matcha, umami, velvety sweet finish.',
            description: 'Bubuk matcha ceremonial grade asli dari Uji, Kyoto dipadukan dengan susu segar yang lembut, menghadirkan nuansa umami yang memikat.'
        },
        {
            id: 'choco-mint-milk',
            name: 'Choco Mint Milk',
            category: 'noncoffee',
            categoryLabel: 'Artisan Non-Coffee',
            type: 'noncoffee',
            price: 40000,
            image: 'images/product12.jpeg',
            badge: 'Signature',
            isMostOrdered: false,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['hot', 'iced'],
            origin: 'Jawa Timur Pure Cocoa',
            roastLevel: 'Artisan Blend',
            notes: 'Pure East Java cocoa, fresh garden mint, silky milk.',
            description: 'Cokelat murni kakao Jawa Timur dengan sensasi mint herbal segar dan susu dingin. Perpaduan manis dingin yang memanjakan lidah.'
        },
        {
            id: 'japanese-iced-coffee',
            name: 'Japanese Iced Coffee',
            category: 'signature',
            categoryLabel: 'Flash Brewed',
            type: 'signature',
            price: 48000,
            image: 'images/product8.jpeg',
            badge: 'Artisan',
            isMostOrdered: true,
            hasMilk: false,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'Toraja Sapan Washed',
            roastLevel: 'Light-Medium Roast',
            notes: 'Vibrant citrus acidity, flash chilled over crystal ice.',
            description: 'Kopi seduh tetes panas yang langsung dikristalkan di atas es batu kristal. Menjaga aroma bunga serta rasa buah segar tetap terkunci utuh.'
        },
        {
            id: 'espresso-tonic-fusion',
            name: 'Espresso Tonic Fusion',
            category: 'signature',
            categoryLabel: 'Sparkling Brew',
            type: 'signature',
            price: 50000,
            image: 'images/product15.webp',
            badge: 'Sparkling',
            isMostOrdered: false,
            hasMilk: false,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'House Specialty Blend',
            roastLevel: 'Medium Roast',
            notes: 'Double ristretto, premium tonic water, citrus zest.',
            description: 'Sensasi sparkling tonic water aromatik berkarbonasi dipadu double ristretto kental dan sentuhan perasan sitrus yang meledak segar.'
        },
        {
            id: 'hazelnut-frappuccino',
            name: 'Hazelnut Frappuccino',
            category: 'blended',
            categoryLabel: 'Ice Blended',
            type: 'blended',
            price: 50000,
            image: 'images/product 5.jpeg',
            badge: 'Sweet Treat',
            isMostOrdered: true,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'House Blend Roast',
            roastLevel: 'Medium Roast',
            notes: 'Roasted hazelnut paste, creamy espresso & whipped foam.',
            description: 'Kopi blended lembut dengan pasta hazelnut panggang asli, susu segar, dan topping whipped cream dengan taburan saus karamel.'
        },
        {
            id: 'mocha-freeze',
            name: 'Mocha Freeze',
            category: 'blended',
            categoryLabel: 'Ice Blended',
            type: 'blended',
            price: 48000,
            image: 'images/product 16.jpeg',
            badge: 'Rich Cocoa',
            isMostOrdered: false,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'House Blend & Belgian Cocoa',
            roastLevel: 'Medium-Dark Roast',
            notes: 'Belgian cocoa, espresso shot, whipped cream.',
            description: 'Perpaduan cokelat Belgia kaya rasa, espresso shot, dan es yang diblend halus sempurna dengan mahkota whipped cream manis.'
        },
        {
            id: 'vanilla-cold-creme',
            name: 'Vanilla Cold Crème',
            category: 'blended',
            categoryLabel: 'Ice Blended',
            type: 'blended',
            price: 47000,
            image: 'images/product17.jpeg',
            badge: 'Silky',
            isMostOrdered: false,
            hasMilk: true,
            defaultTemp: 'iced',
            allowedTemps: ['iced'],
            origin: 'Madagascar Vanilla Pods',
            roastLevel: 'Non-Coffee Frappé',
            notes: 'Madagascar vanilla bean, rich sweet cream, ice blended.',
            description: 'Blended biji vanila Madagaskar dengan krim susu lembut dingin untuk Anda yang mendambakan rasa manis yang menenangkan hati.'
        }
    ];

    const MrCoffeeProducts = {
        getAll() {
            return products;
        },

        getMostOrdered() {
            return products.filter(p => p.isMostOrdered);
        },

        getByType(type) {
            if (!type || type === 'all') return products;
            return products.filter(p => p.type === type);
        },

        getById(id) {
            if (!id) return null;
            return products.find(p => p.id === id || p.name.toLowerCase() === id.toLowerCase()) || null;
        },

        formatRp(val) {
            return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
        },

        resolveImage(imgPath) {
            if (!imgPath) return 'images/product1.jpeg';
            if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
            
            const isInsidePages = window.location.pathname.includes('/pages/');
            const cleanPath = imgPath.replace(/^\.\.\//, '');
            return isInsidePages ? '../' + cleanPath : cleanPath;
        }
    };

    window.MrCoffeeProducts = MrCoffeeProducts;
})();
