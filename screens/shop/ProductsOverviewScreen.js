import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Button, Platform, ActivityIndicator, View , Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import * as cartActions from '../../store/actions/cart';
import Colors from '../../constants/Colors';
import * as productsActions from '../../store/actions/products';

const ProductsOverviewScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const products = useSelector(state => state.products.availableProducts);
  const dispatch = useDispatch();

  const loadProducts = useCallback(async () => {
    setError(null);//si no lo arranco en null, mas abajo se
    //puede quedar pegado con "An error ocurred" y cada vez que 
    // presione el boton try again volveré otra vez a mostrar el mismo boton
    //osea evitamos un loop de siempre mostrar el boton de try again
    setIsRefreshing(true);
    try{
      await dispatch(productsActions.fetchProducts());
    }catch(err){
      setError("An error ocurred.");
    }
    setIsRefreshing(false);
  },[dispatch, setIsLoading,setError]);

  //Acá hay que hacer un fix para cuando navegamos a este componente que muestra todos los productos
  //como estamos usando un navigation drawer, éste NO RECREA el componente al cual navegamos nuevamente
  //solo guarda en memoria los componentes en su primer renderizado y al navegar nos muestra estos 
  //componentes desactualizados!!!. Stack navigator , por ejemplo SÍ RECREA los componentes
  // Para solucionar este problema suscribiremos un listener al navigation drawer, a traves de useEffect
  // Este listener invocará a loadProducts para que se recree el componente con cada vez que se 
  //dispare un evento del drawer, en ese caso , willFocus , osea cuando el componente gane el foco al usar el 
  //drawer, ahi se obliga al renderizado invocando a loadProducts, el cual sí genera cambio en el state!!!
  useEffect(() => {
    //hay mas eventos: didFocus, willBlur, didBlur, etc
    const willFocusSub = props.navigation.addListener('willFocus', loadProducts);

    //eliminamos la suscripcion al desmontar el componente
    return () => {
      willFocusSub.remove();
    }
  }, [loadProducts]);//no pongo como dependencia a props porque navigation nunca va a cambiar y no generar
  //rerenders o loops cuando otras props cambien!!

  //este useEffect solo serviría para que se carguen los productos la primera vez que se renderice el componente
  useEffect(() => {
    setIsLoading(true);
    loadProducts().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadProducts]);

  const selectItemHandler = (id, title) => {
    props.navigation.navigate('ProductDetail', {
      productId: id,
      productTitle: title
    });
  };

  if(isLoading){
    return <View style={styles.centered}>
      <ActivityIndicator  color={Colors.primary} size="large" />
    </View>
  }

  if(error){
    return <View style={styles.centered}>
        <Text>{error}</Text>
        <Button title="Try again" onPress={loadProducts} color={Colors.primary} />
    </View>
  }

  if(!isLoading && products.length === 0){
    return <View style={styles.centered}>
        <Text numberOfLines={2}>No products found. Maybe it's time to add some!</Text>
    </View>
  }



  return (
    <FlatList
      onRefresh={loadProducts}
      refreshing={isRefreshing}
      data={products}
      keyExtractor={item => item.id}
      renderItem={itemData => (
        <ProductItem
          image={itemData.item.imageUrl}
          title={itemData.item.title}
          price={itemData.item.price}
          onSelect={() => {
            selectItemHandler(itemData.item.id, itemData.item.title);
          }}
        >
          <Button
            color={Colors.primary}
            title="View Details"
            onPress={() => {
              selectItemHandler(itemData.item.id, itemData.item.title);
            }}
          />
          <Button
            color={Colors.primary}
            title="To Cart"
            onPress={() => {
              dispatch(cartActions.addToCart(itemData.item));
            }}
          />
        </ProductItem>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

ProductsOverviewScreen.navigationOptions = navData => {
  return {
    headerTitle: 'All Products',
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    ),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cart"
          iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          onPress={() => {
            navData.navigation.navigate('Cart');
          }}
        />
      </HeaderButtons>
    )
  };
};

export default ProductsOverviewScreen;
