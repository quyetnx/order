/*global chrome*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class SkuItem extends Component {
    explainSku() {
        return this.props.name.split('>');
    }

    getImages() {
        const skuItems = this.explainSku();

        let images = [];
        const groups = Object.keys(this.props.config);
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const skuConfig = this.props.config[group];
            skuItems.map(skuName => {
                const sku = skuConfig[skuName];
                if (sku && typeof sku.images === 'string' && sku.images !== '') {
                    images.push((
                        <img src={sku.images} key={sku.images} style={{width: 40, height: 40}}/>
                    ));
                }
            });
        }
        return images;
    }

    render() {
        return (
            <div>
                {this.props.name}
                <div>
                    {this.getImages()}
                </div>
            </div>
        );
    }
}

class ProductItem extends Component {
    render() {
        console.log(this.props.data);
        return (
            <div>
                {Object.keys(this.props.data.cart).map(sku => (
                    <SkuItem
                        key={sku}
                        quantity={this.props.data[sku]}
                        name={sku}
                        config={this.props.data.sku}
                    />
                ))}
            </div>
        );
    }
}

class Products extends Component {
    render() {
        return (
            <div>
                {Object.keys(this.props.data).map(productId => {
                    return (
                        <ProductItem key={productId} data={this.props.data[productId]}/>
                    );
                })}
            </div>
        );
    }
}

class ShopInfo extends Component {
    render() {
        return (
            <div>
                <pre>{JSON.stringify(this.props.data, null, 2)}</pre>
            </div>
        );
    }
}

class ListByWebsite extends Component {
    render() {
        return (
            <div>
                {Object.keys(this.props.data).map(shopName => {
                    if (shopName !== '') {
                        return (
                            <div key={shopName}>
                                <ShopInfo
                                    data={this.props.data[shopName].info}
                                />
                                <Products
                                    data={this.props.data[shopName].products}
                                />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }
}

export default class ShoppingCart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cart: null
        };
    }

    componentDidMount() {
        // chrome.storage.onChanged.addListener(this.onReceiveDataHandle.bind(this));

        chrome.storage.local.get({cart: []}, items => {
            this.setState({
                cart: items.cart
            });
        });
    }

    render() {
        if (!this.state.cart) {
            return (
                <div>Loading...</div>
            );
        }
        console.log(this.state.cart);
        return (
            <div>
                {Object.keys(this.state.cart).map(key => (
                    <div key={key}>
                        <ListByWebsite
                            data={this.state.cart[key]}
                        />
                    </div>
                ))}
            </div>
        );
    }
}

ShoppingCart.propTypes = {};