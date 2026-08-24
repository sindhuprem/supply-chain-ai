import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

function Dashboard({ role }) {
  return (
    <div style={{ padding: "40px" }}>
      <h1>{role} Dashboard</h1>
      <p>Dashboard coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/manufacturer"
          element={<Dashboard role="Manufacturer" />}
        />

        <Route
          path="/distributor"
          element={<Dashboard role="Distributor" />}
        />

        <Route
          path="/transporter"
          element={<Dashboard role="Transporter" />}
        />

        <Route
          path="/retailer"
          element={<Dashboard role="Retailer" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;