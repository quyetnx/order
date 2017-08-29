/*global chrome*/
let _timer;

jQuery.fn.getObjectText = function () {
    if (jQuery('a', this).length === 1) {
        return jQuery('a', this).text().replace(/(\r\n|\n|\r|\s\s+)/gm, ' ').trim();
    }
    return this.text().replace(/(\r\n|\n|\r|\s\s+)/gm, ' ').trim();
};

jQuery.fn.getObjectImage = function () {
    const j = jQuery;
    if (this.prop('tagName').toLowerCase() === 'img') {
        return this.attr('src');
    } else if (j('img:first-child', this).length === 1) {
        return j('img:first-child', this).attr('src');
    } else {
        const findObjectBackgroundImageRecursive = (obj) => {
            if (obj.length === 0) return false;
            let css;
            if (obj.length === 1) {
                css = obj.css('background-image');
                if (!css || css === 'none') {
                    css = findObjectBackgroundImageRecursive(obj.children());
                }
                return !css || css === 'none' ? false : css.replace(/(url\(|\)|'|")/gi, '');
            } else {
                for (let i = 0; i < obj.length; i++) {
                    css = findObjectBackgroundImageRecursive(j(obj[i]));
                    if (css || css !== 'none') {
                        break;
                    }
                }
                return css;
            }
        };

        return findObjectBackgroundImageRecursive(this);
    }
};

String.prototype.queryParams = function () {
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
    shop: null,
    product: null,
    config: {},
    data: {},
    init(j) {
        this.j = j;
        clearTimeout(_timer);
        _timer = setTimeout(() => {
            alert('Ok!!!!');

            this.getConfigs(this.execv2.bind(this));

            clearTimeout(_timer);
        }, 300);
    },
    bindData(e) {
        const {j, config} = this;
        let skuText = [];
        const wrap = j(config.selector.wrap);

        j(config.selector.selectedClass, wrap).each(function () {
            const t = j(this).getObjectText();
            skuText.push(t);
        });

        const btn = j('.my-order-button', wrap);

        if (skuText.length === j(config.selector.skuRows, wrap).length) {
            // validated -> add to session
            const skuSelected = skuText.join('>');
            setTimeout(() => {
                this.cart['cart'][skuSelected] = parseInt(j(config.selector.cartControl.input, wrap).val());

                if (j(config.selector.cartControl.denied, wrap).length > 0) {
                    btn.addClass('disabled');
                } else {
                    btn.removeClass('disabled');
                }
                this.submit();
            }, 200);
        }
    },
    skuMapper() {
        const c = this.config.selector;
        const j = this.j;
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
                        let value = obj.getObjectText();

                        let img = obj.getObjectImage();

                        skuItems[value] = {name: value, images: img || {}};
                    }
                });
                skuRows[group] = skuItems;
            }
        });
        return skuRows;
    },
    changeInputState() {
        const {j, config} = this;
        j(config.selector.cartControl.input, j(config.selector.wrap)).change();
    },
    execv2() {
        this.productInfo();

        if (!this.product || !this.product.id) {
            console.warn('Sorry, we can\'t help you order this product, please try another. Happy shopping with us.');
            return;
        }

        this.shopInfo();

        this.cart.sku = this.skuMapper();

        // order
        const {j, config, shop} = this;

        const wrap = j(config.selector.wrap);

        j(config.selector.cartControl.input, wrap).on('change', this.bindData.bind(this));

        j(config.selector.cartControl.control, wrap).on('click', this.changeInputState.bind(this));

        j(config.selector.btnOrder, wrap)
            .attr('class', 'remove-default-class')
            .css({position: 'relative', display: 'inline-block'})
            .append('<button class="my-order-button">Đặt hàng ngay</button>');
        j('.my-order-button', wrap).on('click', this.changeInputState.bind(this));

        j('body').prepend('<button id="reset">Reset</button>');
        j('#reset').on('click', () => {
            chrome.storage.local.clear();
            alert('clear');
        });
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
                j(c.selectedClass, wrap).each(function () {
                    const t = j(this).getObjectText();
                    skuText.push(t);
                });
                if (skuText.length === j(c.skuRows, wrap).length) {
                    // validated -> add to session
                    const skuSelected = skuText.join('>');
                    this.cart['cart'][skuSelected] = parseInt(j(c.cartControl.input, wrap).val());
                }
            });

            j(c.cartControl.input, wrap).on('change blur', () => {
                console.log(123);

            });

            j(c.btnOrder).on('click', this.order.bind(this))
        }
    },
    updateCart(cart) {
        const cartData = this.cart;
        if (Object.keys(cart).length === 0) {
            return {
                [this.website]: {
                    [this.shop.name]: {
                        info: this.shop,
                        products: {
                            [this.product.id]: {
                                info: this.product,
                                ...cartData
                            }
                        }
                    }
                }
            };
        } else {
            return {
                ...cart,
                [this.website]: {
                    ...(cart[this.website] || {}),
                    [this.shop.name]: {
                        info: this.shop,
                        products: {
                            ...(cart[this.website][this.shop.name] ? cart[this.website][this.shop.name].products : {}),
                            [this.product.id]: {
                                info: this.product,
                                ...(cart[this.website][this.shop.name] ?
                                    cart[this.website][this.shop.name].products[this.product.id] : {}),
                                ...cartData
                            }
                        }
                    }
                }
            };
        }
    },

    /**
     * Send data to popup
     */
    submit() {
        // chrome.storage.local.clear();
        chrome.storage.local.get({cart: {}}, items => {
            const data = this.updateCart(items.cart);
            chrome.storage.local.set({cart: data}, () => {
                console.log(data);
                console.warn('Added to cart!');
            });
        });
    },
    getConfigs(cb) {
        const p = new Promise((resolve, reject) => {
            const domain = this.getCurrentDomain();
            this.j && this.j.getJSON(chrome.extension.getURL('/js/config.json'), config => {
                if (config[domain.domain]) {
                    resolve(config[domain.domain]);
                } else {
                    reject('Config not found.');
                }
            });
        });
        p.then(config => {
            this.config = config;
            if (typeof cb === 'function') cb();
        });
    },
    getPrice(selector, count = 1) {
        const {j} = this;
        let result = '0';
        const o = j(selector);
        if (o.length > 0) {
            for (let i = 0; i < o.length; i++) {
                const text = j(o[i]).getObjectText();
                if (text.length > 0) {
                    result = text;
                    break;
                }
            }
        }
        return result;
    },
    productInfo() {
        const {j, config} = this;
        const link = j(config.selector.product.link.target);
        let url = link.attr('href');
        if (url.indexOf('http') < 0) {
            let t = url.split(':');
            url = 'http:' + t[t.length - 1];
        }

        const urlObject = new URL(url);
        const params = urlObject.search.queryParams();

        this.product = {
            id: params[config.selector.product.link.params] || false,
            name: link.getObjectText(),
            url: url,
            image: j(config.selector.product.image).getObjectImage(),
            price: this.getPrice(config.selector.product.price)
        };
    },
    shopInfo() {
        const {j, config} = this;
        const shopLink = j(config.selector.shopLink);
        this.shop = {
            name: shopLink.getObjectText(),
            url: shopLink.attr('href')
        };
    },
    getCurrentDomain() {
        const url = new URL(window.location.toString());

        const paths = url.hostname.split('.');

        const result = {
            hostname: url.hostname,
            domain: paths[paths.length - 2]
        };

        this.website = result.domain;

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