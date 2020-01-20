import React, {useState, useEffect, useCallback, useReducer } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView ,
  ActivityIndicator
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productsActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import Colors from '../../constants/Colors';


const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

//ponemos esta funcion afuera del componente porque no depende del state o props
//y no queremos que se cree esta funcion en cada rerender ni usar useCallback cuando no se necesita
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


const EditProductScreen = props => {

  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState();

  const prodId = props.navigation.getParam('productId');
  const editedProduct = useSelector(state =>
    state.products.userProducts.find(prod => prod.id === prodId)
  );
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: '',
    },
    inputValidities: {
      title: editedProduct ? true: false,
      imageUrl: editedProduct ? true: false,
      description: editedProduct ? true: false,
      price: editedProduct ? true: false,
    },
    formIsValid: editedProduct ? true: false
  });

  useEffect(() => {
    if(error){
      Alert.alert('An error ocurred.', error, [{text: 'Ok'}]);
    }
  }, [error]);

  const submitHandler = useCallback(async () => {
    if(!formState.formIsValid){
      Alert.alert('Wrong input!','Please check errors in the form.', [
        {text: 'Okay'}
      ]);
      return;
    }
    //acá inicializamos el state del spinner y del error
    //para causar un rerender y que el spinner se vea mientras se despacha el update o create a firebase
    setError(null);
    setIsloading(true);

    try{
        if (editedProduct) {
          //podemos usar await aqui porque este dispatch esta usando redux-thunk , 
          //osea este action creator devuelve una promesa!!
          await dispatch(
            productsActions.updateProduct(prodId, formState.inputValues.title, 
              formState.inputValues.description, 
              formState.inputValues.imageUrl)
          );
        } else {
          await dispatch(
            productsActions.createProduct(formState.inputValues.title, 
              formState.inputValues.description, 
              formState.inputValues.imageUrl, 
              +formState.inputValues.price)
          );
        }
        
        props.navigation.goBack();
    }catch(err){
      setError(err.message);
    }
    setIsloading(false);
   
  }, [dispatch, prodId, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);


  const inputChangeHandler = useCallback((inputIdentifier,inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE, 
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier
      });
  }, [dispatchFormState]);

  if(isLoading){
    return <View style={styles.centered}>
      <ActivityIndicator size="large"  color={Colors.primary} />
    </View>
  }

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding" keyboardVerticalOffset={70}>
      <ScrollView>
        <View style={styles.form}>
          <Input 
            label="Title"
            keyboardType="default"
            errorText="Please enter a valid title!"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"//solo dice qué apariencia tendrá el boton de enter del teclado
            // si uso bind, origino que inputChangeHandler se recree en cada letra que tecleo
            //lo cual originará que hayan muchos rerender en el componente Input y el comportamiento
            // de la logica de validacion se va a la mierda!!
           /*  onInputChange={inputChangeHandler.bind(this, 'title')} */
           //usamos sin bind. para esto agregamos un prop extra llamado id donde mandaremos el identifier
            onInputChange={inputChangeHandler}
            id="title"
            initialValue={editedProduct ? editedProduct.title : ''}
            initiallyValid={!!editedProduct}//doble !! es para enviar true o false y NO el valor de initiallyValid en sí
            required
          />
          <Input 
            label="Image Url"
            errorText="Please enter a valid url!"
            keyboardType="default"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            id="imageUrl"
            initialValue={editedProduct ? editedProduct.imageUrl : ''}
            initiallyValid={!!editedProduct}
            required
          />
          {editedProduct ? null : (
             <Input 
              label="Price"
              errorText="Please enter a valid price!"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              id="price"
              required
              min={0.1}
           />
          )}
          <Input 
            label="Description"
            errorText="Please enter a valid description!"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            multiline
            numberOfLines={3}//solo funca para android
            initialValue={editedProduct ? editedProduct.description : ''}
            initiallyValid={!!editedProduct}
            onInputChange={inputChangeHandler}
            id="description"
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  );
};

EditProductScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId')
      ? 'Edit Product'
      : 'Add Product',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default EditProductScreen;
