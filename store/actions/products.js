export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';
import Product from '../../models/product';

export const fetchProducts = () => {
  //fecth por default es GET así que no requerimos de mas configuraciones para obtener
  //la lista de productos guardados!!
  return async dispatch => {
    const response = await fetch('https://rn-shop-app-afcd8.firebaseio.com/products.json');

    const resData = await response.json();
    //firebase nos trae un objeto que es como un mapa con pares tipo id: objeto producto 
    //console.log(resData);
    const loadedProducts = [];
    for(const key in resData){
      loadedProducts.push(new Product(key,'u1',
      resData[key].title,resData[key].imageUrl,
      resData[key].description, resData[key].price));
    }

    dispatch({type: SET_PRODUCTS, products: loadedProducts});
  }
  
};

export const deleteProduct = productId => {
    return async (dispatch, getState) => {
      const token = getState().auth.token;
      //firebase necesita que le mandemos el id en la url
      const response = await fetch(`https://rn-shop-app-afcd8.firebaseio.com/products/${productId}.json?auth=${token}`, {
        method: 'DELETE',
      });
      if(!response.ok){
        throw new Error("Couldn´t reach the server!");
      }
    dispatch({ type: DELETE_PRODUCT, pid: productId }) ;
  };
}

export const createProduct = (title, description, imageUrl, price) => {
  //al configurar redux thunk en App.js y odemos usar asincronia para hacer algo antes de
  //de invocar al dispatch. el dispatch será invocado por redux thunk. nosotros devolvemos
  //un calllback que es el que justamente ejecutará redux thunk y nos pasa el dispatch para que 
  //nosotros decidamos en qué momento del callback se invocará el dispacth
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    //acá ponemos el codigo asincrono oque queramos!!
    //felizmente fetch está soportado en RN
    //al final de la url proporcionada por firebase, ponemos el nombre del recurso que
    //queremos afectar, es como la tabla , la cual debe terminar en .json , esto es 
    //requerido por firebase!
    const response = await fetch(`https://rn-shop-app-afcd8.firebaseio.com/products.json?auth=${token}`, {
      method: 'POST',//post porque es una operacion de creacion
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({//JSON tambien es soportado por RN
        //no mandamos el id porque firebase nos genera un id por defecto
        title,
        description,
        imageUrl,
        price
      })
    });

    const resData = await response.json();

    dispatch(
      {
        type: CREATE_PRODUCT,
        productData: {
          id: resData.name,//id obtenido de firebase
          title,
          description,
          imageUrl,
          price
        }
      }
    ) 
  }
  
};

export const updateProduct = (id, title, description, imageUrl) => {
  //redux thunk nos permite usar un callback para invocar a dispatch asincronamente
  //pero tambien nos pasa como parametro al state general (combine reducers) en forma de funcion
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    //console.log(id,'/',token);
    //firebase necesita que le mandemos el id en la url
    //firebase permite mandar el token de autenticacion para evaluar los permisos del user
    //Para activar esa funcionalidad de validar users en firebase tenemos que editar 
    //los rules de firebase , de nuestra database de esta forma:
    // {
    //   "rules": {
    //     ".read": true,
    //     ".write": "auth != null"
    //   }
    // }
    const response = await fetch(`https://rn-shop-app-afcd8.firebaseio.com/products/${id}.json?auth=${token}`, {
      method: 'PATCH',//patch solo actualiza los campos que sean necesarios
      // a diferencia de PUT que reemplaza todo el objeto
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        //price  el precio NO lo vamos a actualizar
      })
    });

    if(!response.ok){
      throw new Error("Couldn´t reach the server!");
    }

    dispatch(
      {
        type: UPDATE_PRODUCT,
        pid: id,
        productData: {
          title,
          description,
          imageUrl,
        }
      }
    ) ;
  }
  
};
