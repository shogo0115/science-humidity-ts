import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/title";
import Graph from "./pages/Graph";
import House from "./pages/House";
import Cup from "./pages/Cup";
import WindowWinter from "./pages/WindowWinter";
import Towel from "./pages/Towel";


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
