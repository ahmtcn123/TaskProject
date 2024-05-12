import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './routes/Login';
import { SnackbarProvider } from 'notistack';
import Register from './routes/Register';
import Todos from './routes/Todos';

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Todos />,
  },
  //404
  {
    path: "*",
    element: <div style={{ textAlign: "center", padding: 100 }}><h1>404 Not Found</h1></div>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);
