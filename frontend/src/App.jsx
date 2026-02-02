import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Chat from './pages/Chat';
import MapPage from './pages/Map';
import Admin from './pages/Admin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Login />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="admin" element={<Admin />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
