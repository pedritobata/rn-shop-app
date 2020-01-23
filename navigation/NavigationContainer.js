//Este componente solo es un wrapper para ShopNavigator
//esto porque necesitamos un componente superior a ShopNavigator para que acceda al store de redux y
// lea el token de autenticacion
//cuando el token ya no existe, sea porque se borró o porque venció, este componente obtendrá
//una referencia a ShopNavigator y con ella invocará al navigation para mandarnos a la pantalla de login!!

import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import ShopNavigator from './ShopNavigator';

const NavigationContainer = props => {
    const navRef = useRef();
    const isAuth = useSelector(state => state.auth.token);

    useEffect(() => {
        if(!isAuth){
            //como ShopNavigator es un AppContainer, tiene un metodo dispatch que permite
            //disparar funcionalidades de éste desde un componente padre
            navRef.current.dispatch(
                NavigationActions.navigate({routeName: 'Auth'})
            );
        }
    },[isAuth]);

    return <ShopNavigator ref={navRef} />
}

export default NavigationContainer;