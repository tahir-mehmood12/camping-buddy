import React, { useState, useContext, useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';

import { AuthenticatedUserContext } from '../providers';

import { auth } from '../config';

import Login from '../screens/Login';
import Error from '../screens/Error';
import PublicShare from '../components/Share/PublicShare';

import Launch from '../screens/Launch';
import Loading from '../components/UI/Loading';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import UserContextProvider from '../store/user-context';

const router = createBrowserRouter([
  { path: '/', element: <Login/>, errorElement: <Error />},
  { path: '/share/:groupId', element: <PublicShare/> },
  { path: '/share/:groupId/:memberId', element: <PublicShare/> },
])


export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuthStateChanged = onAuthStateChanged(
      auth,
      authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
   // unsubscribe auth listener on unmount
    return unsubscribeAuthStateChanged;
  }, [user]);

 
  if (isLoading) {
    return ( <Loading msg='Loading' />)
  }

  return (

    <>

    {user ?

    <UserContextProvider>
      <Launch />
    </UserContextProvider>

    : <RouterProvider router={router }/>

    }

    </>
      
  );
};
