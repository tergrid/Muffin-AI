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
import RootLayout from './layouts/rootLayout/rootLayout.jsx';
import DashboardLayout from './layouts/dashboardLayout/dashboardLayout.jsx';
import SigninPage from './routes/signinPage/SigninPage.jsx';
import SignupPage from './routes/signupPage/SignupPage.jsx';



const router = createBrowserRouter([
  {
    element:<RootLayout></RootLayout>,
    children:[
      {
        path: "/", element:<HomePage></HomePage>
      },
      {
        path: "/sign-in/*", element:<SigninPage/>
      },
      {
        path: "/sign-up/*", element:<SignupPage/>
      },
      {
        element:<DashboardLayout></DashboardLayout>,
        children:[
          {
            path:"/dashboard",
            element: <DashboardPage></DashboardPage>,
          },
          {
            path:"/dashboard/chats/:id",
            element: <ChatPage></ChatPage>,
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
