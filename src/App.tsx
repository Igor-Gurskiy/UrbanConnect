import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "./services/store";
import { AppHeader } from "./components/AppHeader/index";
import "./App.css";
import { Modal } from "./components/Modal/index";
import { Register } from "./components/Register/index";
import { Login } from "./components/Login/index";
import { getUser, setAuthChecked } from "./services/slices/Profile/Profile";
import { getCookie, deleteCookie } from "./utils/cookies";
import { ProtectedRoute } from "./components/protected-route";
import { HomePage } from "./components/homePage/homePage";
import { Chat } from "./components/Chat/Chat";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken || refreshToken) {
      dispatch(getUser())
        .unwrap()
        .catch((error) => {
          console.error("Authorization failed:", error);
          deleteCookie("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(setAuthChecked(true));
        });
    } else {
      dispatch(setAuthChecked(true));
    }
  }, [dispatch]);

  const location = useLocation();
  const locationState = location.state as { background?: Location };
  const background = locationState && locationState.background;

  return (
    <>
      <AppHeader />
      <Routes location={background || location}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Modal type="Log in" children={<Login />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute onlyUnAuth>
              <Modal type="Sign up" children={<Register />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Другие роуты вашего приложения */}
      </Routes>
    </>
  );
}

export default App;
