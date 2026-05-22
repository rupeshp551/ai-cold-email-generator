import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const userData = {
      token: data.token,
      username: data.username,
      email: data.email,
    };

    localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("token", data.token);
    setUser(userData);
  };

  // Hard reset state on logout
  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);

    setTimeout(() => {
      window.location.href = "/login"; // ensures full reset
    }, 50);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};