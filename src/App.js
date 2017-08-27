/*global chrome*/
import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

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

    componentDidMount() {
        chrome.storage.onChanged.addListener(this.onReceiveDataHandle.bind(this));

        chrome.storage.local.get({cart: []}, items => {
            this.setState({
                cart: items.cart
            });
        });
        // chrome.storage.onChanged.addListener((changes, areaName) => {
        //     chrome.browserAction.setBadgeText({text: (changes.count.newValue||0).toString()});
        // });
    }

    render() {
        console.log(this.state.cart);
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.

                    <ul>
                        {this.state.logs.map(g => (
                            <li key={g}>{g}</li>
                        ))}
                    </ul>
                </p>
            </div>
        );
    }
}

export default App;
