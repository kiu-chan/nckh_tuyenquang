import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import DefaultLayout from './components/Layout/DefaultLayout';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route, index) => {
              const Page = route.component;
              
              if (route.layout === null) {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={<Page />}
                  />
                );
              }

              const Layout = route.layout || DefaultLayout;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}

            {/* Private Routes */}
            {privateRoutes.map((route, index) => {
              const Page = route.component;
              const Layout = route.layout;
              
              return (
                <Route
                  key={`private-${index}`}
                  path={route.path}
                  element={
                    <PrivateRoute allowedRoles={route.allowedRoles || []}>
                      {Layout ? (
                        <Layout>
                          <Page />
                        </Layout>
                      ) : (
                        <Page />
                      )}
                    </PrivateRoute>
                  }
                />
              );
            })}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;