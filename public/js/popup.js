/*global chrome*/
let _timer;
const helpers = {
    port: null,
    cart: {},
    init(j) {
        clearTimeout(_timer);
        _timer = setTimeout(() => {
            alert('Ok!!!!');

            let carts = {
                sku: [],
                items: {}
            };


            j('.list-leading li').each(function () {
                const w = j(this),
                    o = j('.unit-detail-spec-operator', w),
                    data = o.data('unitConfig'),
                    images = o.data('imgs');
                if (data) {
                    carts.sku.first[data.name] = {...data, images};
                }
            });

            j('.table-sku tr').each(function () {
                let row = j(this),
                    ctl = j('.control', row),
                    skuConfig = row.data('skuConfig');

                carts.sku.seconds[skuConfig.skuName] = skuConfig;

                j('a', ctl).on('click', () => {
                    // console.log(skuConfig);
                    const s = j('.unit-detail-spec-operator.active:visible');
                    const sConfig = s.data('unitConfig');
                    // console.log(sConfig);
                    let t = j('.amount-input', ctl).val();
                    carts.items[`${sConfig.name}+${skuConfig.skuName}`] = parseInt(t);

                    chrome.storage.local.get({cart: []}, cartItems => {
                        cartItems.cart = carts;

                        chrome.storage.local.set({cart: cartItems.cart});
                    });
                });
            });
            console.log(carts);

            clearTimeout(_timer);
        }, 300);
    }
};

((_WIN, $$$) => {
    _WIN.onload = helpers.init.bind(helpers, $$$)
})(window, jQuery);