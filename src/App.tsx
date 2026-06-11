import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Viewer from './Viewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/m/:slug" element={<Viewer />} />
        <Route path="*" element={
          <div className="not-found">
            <h1>404</h1>
            <p>Document Not Found</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
