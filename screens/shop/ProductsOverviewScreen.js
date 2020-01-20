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
  const [error, setError] = useState();
  const products = useSelector(state => state.products.availableProducts);
  const dispatch = useDispatch();

  const loadProducts = useCallback(async () => {
    setError(null);//si no lo arranco en null, mas abajo se
    //puede quedar pegado con "An error ocurred" y cada vez que 
    // presione el boton try again volveré otra vez a mostrar el mismo boton
    //osea evitamos un loop de siempre mostrar el boton de try again
    setIsLoading(true);
    try{
      await dispatch(productsActions.fetchProducts());
    }catch(err){
      setError("An error ocurred.");
    }
    setIsLoading(false);
  },[dispatch, setIsLoading,setError]);

  useEffect(() => {
    loadProducts();
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
