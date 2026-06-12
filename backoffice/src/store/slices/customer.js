// third-party
import { createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'utils/axios';
import { dispatch } from '../index';

// ----------------------------------------------------------------------

const initialState = {
    error: null,
    customers: [],
    orders: [],
    products: [],
    productreviews: [],
    invoices: []
};

const slice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        // HAS ERROR
        hasError(state, action) {
            state.error = action.payload;
        },

        // GET CUSTOMERS
        getCustomersSuccess(state, action) {
            state.customers = action.payload;
        },

        // GET ORDERS
        getOrdersSuccess(state, action) {
            state.orders = action.payload;
        },

        // GET PRODUCTS
        getProductsSuccess(state, action) {
            state.products = action.payload;
        },

        // GET PRODUCT REVIEWS
        getProductReviewsSuccess(state, action) {
            state.productreviews = action.payload;
        },

        // GET INVOICE DATA
        getInvoiceSuccess(state, action) {
            state.invoices = action.payload;
        }
    }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

// export function handleSubmitTerapeuta() {
//     return async () => {
//         try {
//             const response = await axios.post('/datos/terapeuta');
//             dispatch(slice.actions.getCustomersSuccess(response.data.customers));
//         } catch (error) {
//             dispatch(slice.actions.hasError(error));
//         }
//     };
// }

export function getOrders() {
    return async () => {
        try {
            let baseUrl = import.meta.env.VITE_APP_API_URL + '/datos';
            let path = window.location.pathname;

            let endpoint = '';

            if (path.includes('/terapeuta')) {
                endpoint = '/terapeuta/';
            } else if (path.includes('/paciente')) {
                endpoint = '/paciente/';
            } else if (path.includes('/candidato')) {
                endpoint = '/candidato/';
            } else {
                console.error('Ruta no válida');
                return;
            }

            const response = await axios.get(`${baseUrl}${endpoint}`);
            dispatch(slice.actions.getOrdersSuccess(response.data));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// export const handleSubmitTerapeuta = createAsyncThunk(
//     "customer/handleSubmitTerapeuta",
//     async ({ formData, row }, { dispatch }) => {
//       try {
//         let response;
  
//         // Logging para asegurarte de que 'row' está recibiendo los datos correctos
  
//         if (!row) {
//           // Si row es undefined o falsy, realiza un POST
//           response = await axios.post(apiRoutes.profesionalPost(), formData);
//         } else {
//           // Si row existe, realiza un PATCH
//           const updatedData = formData;
  
//           // Logging para asegurar que `updatedData` se está creando correctamente
  
//           response = await axios.patch(
//             apiRoutes.profesionalUpdate(row.id),
//             updatedData
//           );
//         }
  
//         // Despacha la acción para obtener la lista de pacientes actualizada
//         dispatch(getProfesionales());
  
//         return response.data;
//       } catch (error) {
//         let errorMessage;
  
//         switch (true) {
//           case error.response?.status === 422:
//             errorMessage = "Introduzca un mail válido.";
//             break;
//           case error.response?.data?.detail:
//             errorMessage = error.response.data.detail;
//             break;
//           case error.request:
//             errorMessage = "No se recibió respuesta del servidor";
//             break;
//           default:
//             errorMessage = `${error.response.data.detail}`;
//             break;
//         }
//         localStorage.setItem("apiError", errorMessage);
  
//         throw new Error(errorMessage); // Lanza el error para manejarlo en el componente
//       }
//     }
//   );


export function getInvoice() {
    return async () => {
        try {
            const response = await axios.get('/api/invoice/list');
            dispatch(slice.actions.getInvoiceSuccess(response.data.invoice));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getProducts() {
    return async () => {
        try {
            const response = await axios.get('/api/customer/product/list');
            dispatch(slice.actions.getProductsSuccess(response.data.products));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getProductReviews() {
    return async () => {
        try {
            const response = await axios.get('/api/customer/product/reviews');
            dispatch(slice.actions.getProductReviewsSuccess(response.data.productreviews));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}
