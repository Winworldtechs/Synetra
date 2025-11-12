import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimationProvider } from "./context/AnimationContext";
import Login from "./components/login/login";
import Home from "./components/maincomponent/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";
import Layout from "./components/layout/Layout";
import SynetraLanding from "./SynetraLanding/SynetraLanding";
import Designers from "./components/designers/Designers";
import NotFound from "./components/NotFound";

function App() {
  return (
    <AnimationProvider>
      <BrowserRouter>
        <Routes>
        {/* Landing page as default route */}
          <Route path="/" element={<SynetraLanding />} />

        {/* Login page */}
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login />}
          />

        {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/designers" element={<Designers />} />
          </Route>

        {/* 404 Route - This should be the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AnimationProvider>
  );
}

export default App;
