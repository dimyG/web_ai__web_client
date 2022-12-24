import React, {
  Suspense,
  Fragment,
  lazy
} from 'react';
import {
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import LoadingScreen from 'src/components/LoadingScreen';
import AuthGuard from 'src/components/AuthGuard';
import GuestGuard from 'src/components/GuestGuard';
import AlgorithmCreateUpdate from "./features/algorithms/AlgorithmCreateUpdate";
import AlgorithmsListView from "./features/algorithms/AlgorithmsListView";
import AnimationsRoute from "./features/animations/AnimationsRoute";
import {minHeapId} from "./constants";
import About from "./views/About";


export const renderRoutes = (routes = []) => (
  <Suspense fallback={<LoadingScreen />}>
    <Switch>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            render={(props) => (
              <Guard>
                <Layout>
                  {route.routes
                    ? renderRoutes(route.routes)
                    : <Component {...props} />}
                </Layout>
              </Guard>
            )}
          />
        );
      })}
    </Switch>
  </Suspense>
);

const routes = [
  {
    exact: true,
    path: '/404',
    component: lazy(() => import('src/views/errors/NotFoundView'))
  },
  {
    exact: true,
    guard: GuestGuard,
    path: '/login',
    component: lazy(() => import('src/views/auth/LoginView'))
  },
  {
    exact: true,
    path: '/login-unprotected',
    component: lazy(() => import('src/views/auth/LoginView'))
  },
  {
    exact: true,
    guard: GuestGuard,
    path: '/register',
    component: lazy(() => import('src/views/auth/RegisterView'))
  },
  {
    exact: true,
    path: '/register-unprotected',
    component: lazy(() => import('src/views/auth/RegisterView'))
  },
  {
    exact: true,
    path: '/about',
    layout: DashboardLayout,
    component: About
  },
  {
    exact: true,
    path: '/algorithms/list',
    layout: DashboardLayout,
    // lazy load the component?
    component: AlgorithmsListView
  },
  {
    exact: true,
    path: '/animations/:algorithmId/',
    layout: DashboardLayout,
    component: AnimationsRoute
  },
  {
    path: '/algorithms',
    guard: AuthGuard,
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/algorithms/create',
        // guard: AuthGuard,
        component: AlgorithmCreateUpdate
      },
      {
        exact: true,
        path: '/algorithms/:algorithmId',
        // guard: AuthGuard,
        component: AlgorithmCreateUpdate
      },
    ]
  },
  {
    path: '*',
    // guard: AuthGuard,
    // Notice that I have changed TopBar and Navbar (rendered by the DashboardLayout) so that they can be rendered
    // without a logged in user (without a user object)
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/',
        component: () => <Redirect to={`/algorithms/list`} />
        // todo use algorithm's slug in the url but have in mind that the slug might change from the user
      },
      {
        component: () => <Redirect to="/404" />
      }
    ]
  }
]

export default routes
