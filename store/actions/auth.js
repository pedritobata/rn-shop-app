
export const SIGNUP = 'SIGNUP';
export const LOGIN = 'LOGIN';

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

        console.log('***Signup',resData);
        dispatch({type: SIGNUP, token: resData.idToken, userId: resData.localId});
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

        console.log('***Login',resData);
        dispatch({type: LOGIN, token: resData.idToken, userId: resData.localId});
    }
}