import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { ProblemPage } from '@/pages/ProblemPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <div className="page-enter">
          <HomePage />
        </div>
      </Layout>
    ),
  },
  {
    path: '/problem/:slug',
    element: (
      <Layout>
        <div className="page-enter">
          <ProblemPage />
        </div>
      </Layout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
