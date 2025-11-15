import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/title/title";
import Graph from "./pages/graph/Graph";
import House from "./pages/house/House";
import Cup from "./pages/cup/Cup";
import WindowWinter from "./pages/window/WindowWinter";
import Towel from "./pages/towel/Towel";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/house" element={<House />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/winter-window" element={<WindowWinter />} />
        <Route path="/towel" element={<Towel />} />
      </Routes>
    </Router>
  );
};

export default App;
