import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Viewer from './Viewer';
import Downloader from './Downloader';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/m/:slug" element={<Viewer />} />
        <Route path="/d/:slug" element={<Downloader />} />
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
