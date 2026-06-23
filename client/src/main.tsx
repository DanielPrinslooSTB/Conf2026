import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DisputeListPage } from "./pages/DisputeListPage";
import { CreateDisputePage } from "./pages/CreateDisputePage";
import { DisputeDetailPage } from "./pages/DisputeDetailPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DisputeListPage />} />
          <Route path="disputes/new" element={<CreateDisputePage />} />
          <Route path="disputes/:id" element={<DisputeDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
