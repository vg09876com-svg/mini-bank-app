import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Change this to the address of your backend
const API_URL = "http://localhost:8080/api";

const savedToken = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

// Sends email + password to the backend
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Login failed");
      return data; // should contain { user, token }
    } catch (err) {
      return rejectWithValue("Cannot reach the server");
    }
  }
);

// Creates a new account
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Registration failed");
      return data; // should contain { user, token }
    } catch (err) {
      return rejectWithValue("Cannot reach the server");
    }
  }
);

// Asks the backend who is logged in, using the saved token
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token");

      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Session expired");
      return data.user || data; // the user object
    } catch (err) {
      return rejectWithValue("Cannot reach the server");
    }
  }
);

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

const saveSession = (state, payload) => {
  state.user = payload.user;
  state.token = payload.token;
  state.isAuthenticated = true;
  state.loading = false;
  state.error = null;
  localStorage.setItem("token", payload.token);
  localStorage.setItem("user", JSON.stringify(payload.user));
};

const clearSession = (state) => {
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      saveSession(state, action.payload);
    },

    logout: (state) => {
      clearSession(state);
      state.error = null;
    },

    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    updateLocalBalance: (state, action) => {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        saveSession(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      // register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        saveSession(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      // fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // If the token is bad or expired, log the user out
        if (action.payload === "Session expired" || action.payload === "No token") {
          clearSession(state);
        }
      });
  },
});

export const {
  login,
  logout,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  updateUser,
  updateLocalBalance,
} = authSlice.actions;

export default authSlice.reducer;