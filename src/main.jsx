import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createRoot } from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

import HomePage from './routes/homePage/HomePage.jsx';
import DashboardPage from './routes/dashboardPage/DashboardPage.jsx';
import ChatPage from './routes/chatPage/ChatPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element:<HomePage/>
  },
  {
    path: "/dashboard",
    
    children:[
      {
        path: "/dashboard",element: <DashboardPage/>,
        path:"/dashboard/chats/:id",element:<ChatPage/>
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
