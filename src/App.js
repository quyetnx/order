/*global chrome*/
import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import ShoppingCart from './imports/ShoppingCart';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 0,
            logs: [],
            cart: {}
        };
    }

    onReceiveDataHandle(changes, areaName) {
        this.setState({
            count: changes.count.newValue,
            logs: changes.logs.newValue,
        });
    }

    render() {
        return (
            <div>
                <ShoppingCart/>
            </div>
        );
    }
}

export default App;
