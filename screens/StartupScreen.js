import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native';
import Colors from '../constants/Colors';
import { useDispatch } from 'react-redux';
import * as authActions from '../store/actions/auth';


const StartupScreen = props => {
    const dispatch = useDispatch();

    useEffect(()=>{
        const tryLogin = async () => {
            const userData = await AsyncStorage.getItem("userData");
            if(!userData){
                props.navigation.navigate("Auth");
                return;
            }
            const transformedData = JSON.parse(userData);
            const { token, userId, expiryDate } = transformedData;
            const expirationDate = new Date(expiryDate);
            if(expirationDate <= new Date() || !userId || !token){
                props.navigation.navigate("Auth");
                return;
            }

            // si todo está bien navegamos a shop
            props.navigation.navigate("Shop");
            //y despachamos a redux para que se haga el autologin
            //ojo que tambien debemos calcular el tiempo de expiracion del token para suscribirlo al action
            //de authenticate que tambien hace eso para que al momento que el token expire nos haga logout
            const expirationTime = expirationDate.getTime() - new Date().getTime();
            dispatch(authActions.authenticate(userId, token, expirationTime));


        }

        tryLogin();
    },[dispatch]);

    return <View style={styles.screen}>
        <ActivityIndicator size="large" color={Colors.primary} />
    </View>
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default StartupScreen;

