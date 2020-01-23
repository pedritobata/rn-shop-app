//Este paquete sirve para guardar data EN EL DISPOSITIVO!!
import { AsyncStorage } from 'react-native';


//export const SIGNUP = 'SIGNUP';
//export const LOGIN = 'LOGIN';

export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';

let timer;

export const authenticate = (userId, token, expiryTime) => {
    //podemos despachar varias acciones usando redux thunk!!
    return dispatch => {
        //acá suscribimos el action creator que espera a que caduque el token y luego hace logout automatico
        dispatch(setLogoutTimer(expiryTime));
        //esta es la autenticacion normal!!
        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token
        });
    }

}

export const signup = (email, password) => {
    return async dispatch => {

        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCehOmyCz038o-ZS3tzGlkJ6A4KL0IfDIk', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });

       

        if(!response.ok){
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
            let message = 'Something went wrong.';
            if(errorId === 'EMAIL_EXISTS'){
                message = 'Email already exists.';
            }
            throw new Error(message);
        }

        const resData = await response.json();

        //console.log('***Signup',resData);
       // dispatch({type: SIGNUP, token: resData.idToken, userId: resData.localId});
       dispatch(authenticate(resData.localId,resData.idToken, parseInt(resData.expiresIn) * 1000));

        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000)
        saveDataToStorage(resData.idToken,resData.localId, expirationDate);
    }
}

export const login = (email, password) => {
    return async dispatch => {

        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCehOmyCz038o-ZS3tzGlkJ6A4KL0IfDIk', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });

       

        if(!response.ok){
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
            let message = 'Something went wrong.';
            if(errorId === 'EMAIL_NOT_FOUND'){
                message = 'Email could not be found.';
            }else if(errorId === 'INVALID_PASSWORD') {
                message = 'Password incorrect.';
            }
            throw new Error(message);
        }

        const resData = await response.json();

       // console.log('***Login',resData);
       // dispatch({type: LOGIN, token: resData.idToken, userId: resData.localId});
      
       dispatch(authenticate(resData.localId,resData.idToken, parseInt(resData.expiresIn) * 1000));

        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000)
        saveDataToStorage(resData.idToken,resData.localId, expirationDate);
    }
}

export const logout = () => {
    clearLogoutTimer();
    //No usaré async await para esto porque confiaré en que RN limpiará
    //el storage del dispositivo y cualquier error ya sería del sistema operativo
    AsyncStorage.removeItem("userData");
    return {
        type: LOGOUT
    }
}

const clearLogoutTimer = () => {
    if(timer){
        clearTimeout(timer);
    }
}

const setLogoutTimer = expirationTime => {
    return dispatch => {
        timer = setTimeout(() => {
            dispatch(logout());
        },expirationTime);
    }
}

const saveDataToStorage = (token, userId, expirationDate) => {
    //AsyncStorage solo acepta pares string: string
    //por eso como queremos guardar objetos, usaremos stringify
    AsyncStorage.setItem("userData",JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expirationDate.toISOString()
    }));
}