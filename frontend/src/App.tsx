import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import Parent from "@/pages/Parent";
import Shop from "@/pages/Shop";
import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Editor />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/challenge" element={<Editor />} />
      </Routes>
    </AuthContext.Provider>
  );
}
