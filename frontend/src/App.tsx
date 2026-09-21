import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllUrlPage from "./pages/AllUrlPage";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./lib/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/all-urls" element={<AllUrlPage />} />
        </Route>

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <LoginPage />
            </div>
          }
        />

        <Route
          path="/signup"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <SignupPage />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;