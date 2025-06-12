import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from './services/store';
import {AppHeader} from './components/AppHeader/index'
import './App.css'
import {Modal} from './components/Modal/index';
import { Register} from './components/Register/index';
import { Login } from './components/Login/index';
import { getUser } from './services/slices/Profile/Profile';
import { getCookie, deleteCookie } from './utils/cookies';
function App() {
  const dispatch = useDispatch();
    useEffect(() => {

      const accessToken = getCookie("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (accessToken || refreshToken) {
      dispatch(getUser()).unwrap().catch((error) => {
        console.error("Authorization failed:", error);
        // Очищаем токены при неудачной авторизации
        deleteCookie("accessToken");
        localStorage.removeItem("refreshToken");
      });
    }
        
    }, [dispatch]);

  return (
    <>
     <AppHeader />
     <Routes>
        <Route path="/login" element={<Modal type="Log in" children={<Login />}/>} />
        <Route path="/signup" element={<Modal type="Sign up" children={<Register />}/>} />
        {/* Другие роуты вашего приложения */}
      </Routes>
    </>
  )
}

export default App
