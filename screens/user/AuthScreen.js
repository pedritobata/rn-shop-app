import React, { useReducer, useCallback, useState , useEffect} from 'react';
import { View, 
    StyleSheet, 
    ScrollView, 
    KeyboardAvoidingView , 
    ActivityIndicator,
    Alert,
    Button} from 'react-native';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import * as authActions from '../../store/actions/auth';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if(action.type === FORM_INPUT_UPDATE){
      const updatedInputValues = {
        ...state.inputValues,
        [action.input]: action.value
      };
      const updatedInputValidities = {
        ...state.inputValidities,
        [action.input]: action.isValid
      };
      let updatedFormIsValid = true;
      for(let key in updatedInputValidities){
        updatedFormIsValid = updatedFormIsValid && updatedInputValidities[key];
      }
      return {
        ...state,
        inputValues: updatedInputValues,
        inputValidities: updatedInputValidities,
        formIsValid: updatedFormIsValid
      }
    }
    return state;
  }
  

const AuthScreen = props => {

    const [isSignup, setIsSignup] = useState(false);
    const [isLoading, setIsloading] = useState(false);
    const [error, setError] = useState();

    const dispatch = useDispatch();

    const authHandler = async () => {
        let action;
        if(isSignup){
            action = authActions.signup(formState.inputValues.email, formState.inputValues.password);
        }else{
            action = authActions.login(formState.inputValues.email, formState.inputValues.password);
        }
        setError(null);
        setIsloading(true);
        try{
            await dispatch(action);
            props.navigation.navigate("Shop");
        }catch(err){
            setError(err.message);
            //solo interesa quitar el loader cuando hay error y nos quedamos en la
            //pantalla de login
            setIsloading(false);
        }
    }

    useEffect(() => {
        if(error){
            Alert.alert("An error ocurred!", error, [ {text: "Ok"} ]);
        }
    }, [error]);

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
          email: '',
          password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
    });

    const inputChangeHandler = useCallback((inputIdentifier,inputValue, inputValidity) => {
        dispatchFormState({
          type: FORM_INPUT_UPDATE, 
          value: inputValue,
          isValid: inputValidity,
          input: inputIdentifier
        });
    }, [dispatchFormState]);

    return <KeyboardAvoidingView 
                behavior="padding"
                keyboardVerticalOffset={50}
                style={styles.screen}>
        <LinearGradient colors={['#ffedff', '#ffe3ff']} style={styles.gradient}>
            <Card style={styles.authContainer}>
                <ScrollView>
                    <Input  
                        id="email"
                        label="E-mail"
                        keyboardType="email-address"
                        required
                        email
                        initialValue=""
                        autoCapitalize="none"
                        errorText="Please enter a valid email."
                        onInputChange={inputChangeHandler}
                    />
                    <Input  
                        id="password"
                        label="Password"
                        keyboardType="default"
                        required
                        secureTextEntry
                        initialValue=""
                        minLength={5}
                        autoCapitalize="none"
                        errorText="Please enter a valid password."
                        onInputChange={inputChangeHandler}
                    />
                    <View style={styles.buttonContainer}>
                        {isLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Button 
                            title={isSignup ? "Sign Up" : "Login"}
                            color={Colors.primary} 
                            onPress={authHandler}/>}
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button 
                            title={`Switch to ${isSignup ? "Login" : "Sign up"}`}
                            color={Colors.accent} 
                            onPress={() => {
                                setIsSignup(prevState => !prevState)
                            }}/>
                    </View>
                    
                </ScrollView>
            </Card>
        </LinearGradient>
    </KeyboardAvoidingView>
}

AuthScreen.navigationOptions = {
    headerTitle: 'Authenticate'
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    authContainer: {
        width: "80%",
        maxWidth: 400,
        maxHeight: 400,
        padding: 20
    },
    buttonContainer: {
        paddingTop: 10
    }
});

export default AuthScreen;

