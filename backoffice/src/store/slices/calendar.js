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
      state.events = state.events.filter((event) => String(event.id) !== String(eventId));
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getEvents() {
  return async () => {
    try {
      const response = await axios.get("/reuniones/reunion/reuniones_by_user");
      dispatch(slice.actions.getEventsSuccess(response.data.events || []));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addEvent(event) {
  return async (dispatch) => {
    try {
      const response = await axios.post("/reuniones/reunion/", event, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const eventsResponse = await axios.get("/reuniones/reunion/reuniones_by_user");
      dispatch(slice.actions.addEventSuccess(eventsResponse.data.events || [response.data]));
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
      await axios.patch(`/reuniones/reunion/${event.eventId}`, event.update);
      const eventsResponse = await axios.get("/reuniones/reunion/reuniones_by_user");
      dispatch(slice.actions.updateEventSuccess(eventsResponse.data.events || []));
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
      await axios.delete(`/reuniones/reunion/?id=${eventId}`, {
        data: event, // Enviar el evento completo
      });

      const eventsResponse = await axios.get("/reuniones/reunion/reuniones_by_user");
      dispatch(slice.actions.getEventsSuccess(eventsResponse.data.events || []));
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
