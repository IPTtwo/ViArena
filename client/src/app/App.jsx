import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from '../state/StoreProvider';
import { AppRoutes } from './AppRoutes';
export default function App() {
  return <BrowserRouter><StoreProvider><AppRoutes /></StoreProvider></BrowserRouter>
}