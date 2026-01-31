import React from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from './components/App';
import TrashScheduleApp from './reducers/index';
import i18next from './lang/i18n';
import './index.css';
import { configureStore } from '@reduxjs/toolkit'

let store = configureStore({reducer:TrashScheduleApp});

type LangProviderProps = {
    match: object
};

class LangProvider extends React.Component<LangProviderProps,{}> {
    render(){
        const lang = navigator.language || 'ja-JP';
        i18next.changeLanguage(lang.substr(0,2));
        return(
            <App {...this.props}/>
        );
    }
}

let render_flg = false;
if(navigator.cookieEnabled) {
    document.cookie = 'isEnabledCookie=true; '+document.cookie;
    if(document.cookie.length > 0) {
        render_flg = true;
    }
}
const rootElement = document.getElementById('root')
if(render_flg) {
    render(
        <Provider store={store}>
            <LangProvider match={{}} />
        </Provider>,
        rootElement
    );
} else {
    if(rootElement != null) {
        rootElement.innerText = 'ブラウザのCookieが無効になっています。Cookieを有効にしてからお試しください。';
    }
}
