// third-party
import { createSlice } from "@reduxjs/toolkit";

// project imports
import axios from "utils/axios";
import { dispatch } from "../index";

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  events: [],
};

const slice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.error = action.payload;
    },

    // GET EVENTS
    getEventsSuccess(state, action) {
      state.events = action.payload;
    },

    // ADD EVENT
    addEventSuccess(state, action) {
      state.events = action.payload;
    },

    // UPDATE EVENT
    updateEventSuccess(state, action) {
      state.events = action.payload;
    },

    // REMOVE EVENT
    removeEventSuccess(state, action) {
      const eventId = action.payload;
      state.events = state.events.filter((event) => event.id !== eventId);
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getEvents() {
  return async () => {
    try {
      const response = await axios.get(
        "/reuniones/reunion_inicial/reuniones_by_user"
      );
      dispatch(slice.actions.getEventsSuccess(response.data.events));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addEvent(event) {
  return async (dispatch) => {
    try {
      const response = await axios.post("/reuniones/reunion_inicial/", event, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      dispatch(slice.actions.addEventSuccess(response.data));
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.detail || "Error al agregar evento"
        )
      );
      throw error; // Asegura que el error se propague
    }
  };
}

export function updateEvent(event) {
  return async (dispatch) => {
    try {
      const response = await axios.patch(
        `/reuniones/reunion_inicial/{id}`,
        event
      );
      dispatch(slice.actions.updateEventSuccess(response.data.events));
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.detail || "Error al actualizar evento"
        )
      );
      throw error;
    }
  };
}

export function removeEvent(eventId, event) {
  return async (dispatch) => {
    try {
      await axios.delete(`/reuniones/reunion_inicial/?id=${eventId}`, {
        data: event, // Enviar el evento completo
      });

      dispatch(slice.actions.removeEventSuccess(eventId)); // Solo pasamos el ID al reducer
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.detail || "Error al eliminar evento"
        )
      );
      throw error;
    }
  };
}
