import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage/homepage';
import Authentication from './pages/authentication/authentication'
import Explore from './pages/explore/explore';

function App() {
    return (
        <Routes>
            <Route path='/authentication' element={<Authentication />} />
            <Route path='/' element={<Homepage />} />
            <Route path='/explore' element={<Explore />} />
        </Routes>
    );
}

export default App;
