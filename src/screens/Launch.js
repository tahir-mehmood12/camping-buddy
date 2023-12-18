import React from 'react';

import Error from './Error';
import Root from './Root';
import PublicShare from '../components/Share/PublicShare';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Root/>, errorElement: <Error />},
  { path: '/share/:groupId', element: <PublicShare/> },
  { path: '/share/:groupId/:memberId', element: <PublicShare/> },
])

function Launch() {
  return (
   <RouterProvider router={router }/>
  );
}

export default Launch;
