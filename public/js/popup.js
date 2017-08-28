/*global chrome*/
let _timer;

jQuery.fn.getObjectText = function() {
    if (jQuery('a', this).length === 1) {
        return jQuery('a', this).text().replace(/(\r\n|\n|\r|\s\s+)/gm, ' ').trim();
    }
    return this.text().replace(/(\r\n|\n|\r|\s\s+)/gm, ' ').trim();
};

String.prototype.queryParams = function() {
    const str = this.indexOf('?') === 0 ? this.slice(1) : this;
    let result = {};
    str.split('&').map(p => {
        let d = p.split('=');
        result[d[0].trim()] = d[1].trim();
    });
    return result;
};

const helpers = {
    cart: {
        cart: {}
    },
    j: null,
    website: '',
    shopId: '',
    product_id: '',
    init(j) {
        this.j = j;

        clearTimeout(_timer);
        _timer = setTimeout(() => {
            alert('Ok!!!!');

            this.getConfigs(this.exec.bind(this));

            clearTimeout(_timer);
        }, 300);
    },
    exec(config) {
        const j = this.j;
        if (config) {
            const c = config.selector;

            let wrap = j(c.wrap);
            let skuRows = {};
            j(c.skuRows, wrap).each(function (e) {
                const row = j(this);
                const group = j(c.skuGroup, row).text().trim();
                if (group.length > 0) {
                    let rowProperties;
                    if (j(c.skuRows, wrap).length === c.skuProperties.length) {
                        rowProperties = c.skuProperties[e] || c.skuProperties[0];
                    } else {
                        rowProperties = c.skuProperties[c.skuProperties.length - 1];
                    }
                    let skuItems = {};
                    j(rowProperties.list, row).each(function (n) {
                        if (rowProperties.object && rowProperties.attributes) {
                            // Get by attribute data
                            const obj = rowProperties.object === 'this' ? j(this) :
                                j(rowProperties.object, j(this));

                            // attribute primary key
                            const attrKey = Object.keys(rowProperties.attributes)[0];
                            const attrValues = rowProperties.attributes[attrKey];
                            let data = obj.data(attrKey);
                            let name = '';
                            attrValues.map((attr, index) => {
                                if (index === 0) {
                                    // name attribute
                                    name = data[attr] || '';
                                } else {
                                    // extends attribute
                                    if (obj.data(attr)) {
                                        data[attr] = obj.data(attr);
                                    }
                                }
                            });
                            if (name.length > 0) {
                                skuItems[name] = data;
                            }
                        } else {
                            const obj = j(this);
                            let value = obj.text().replace(/(\r\n|\n|\r|\s{2,})/gm, ' ').trim();

                            let images = {};
                            // get by inner text
                            // if (rowProperties.images) {
                            //     const img = j(rowProperties.images[0], obj);
                            //     if (img.length === 1) {
                            //         const rules = rowProperties.images[1].split(':');
                            //         const match = rules[1];
                            //         switch (rules[0]) {
                            //             case 'style':
                            //                 try {
                            //                     const styles = img.css();
                            //                     if (styles[match[1]]) {
                            //                         images = {
                            //                             original: styles[match[1]]
                            //                                 .replace(/(?:^url\(["']?|["']?\)$)/g, "")
                            //                         };
                            //                     }
                            //                 } catch (e) {
                            //
                            //                 }
                            //                 break;
                            //         }
                            //     }
                            // }

                            skuItems[value] = {name: value, images: images};
                        }
                    });
                    skuRows[group] = skuItems;
                }
            });

            this.cart['skuInfo'] = skuRows;

            j(c.cartControl.control, wrap).on('click', () => {
                let skuText = [];
                j(c.selectedClass, wrap).each(function() {
                    const t = j(this).getObjectText();
                    skuText.push(t);
                });
                if (skuText.length === j(c.skuRows, wrap).length) {
                    // validated -> add to session
                    const skuSelected = skuText.join('>');
                    this.cart['cart'][skuSelected] = parseInt(j(c.cartControl.input, wrap).val());
                }
            });

            j(c.btnOrder).on('click', this.order.bind(this))
        }
    },
    updateCart(key, value) {

    },
    getConfigs(callback) {
        const p = new Promise((resolve, reject) => {
            const domain = this.getCurrentDomain();
            this.j && this.j.getJSON(chrome.extension.getURL('/js/config.json'), config => {
                resolve(config[domain.domain] || false);
            });
        });
        p.then(config => callback(config));
    },
    getProductId() {
        const url = new URL(window.location.toString());

        switch (this.website) {
            case 'tmall':
                const queryParams = url.search.queryParams();
                return queryParams.id || false;
            case '1688':
                console.log(url);
                break;
        }
    },
    getCurrentDomain() {
        const url = new URL(window.location.toString());

        const paths = url.hostname.split('.');

        const result = {
            hostname: url.hostname,
            domain: paths[paths.length - 2]
        };

        this.website = result.domain;
        this.product_id = this.getProductId();

        return result;
    },
    order(e) {
        e && e.preventDefault();
        if (Object.values(this.cart.cart).length === 0) {
            alert('Giỏ hàng đang trống');
        } else {
            alert('Đặt hàng thành công.');
            console.log(this.cart);
        }
        return false;
    }
};

((_WIN, $$$) => {
    _WIN.onload = helpers.init.bind(helpers, $$$)
})(window, jQuery);