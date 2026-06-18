import { Route, Routes } from 'react-router-dom';
import DemoPage from './pages/DemoPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
    </Routes>
  );
}
