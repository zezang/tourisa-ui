import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import TouristaApp from "./TouristaApp";

const container = document.getElementById("root") as Element;
const root = createRoot(container);

const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<TouristaApp />} />),
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
