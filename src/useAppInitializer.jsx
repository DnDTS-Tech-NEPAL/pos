// hooks/useAppInitializer.js
import { useEffect } from "react";
import api from "../api"; // Adjust path as needed

export const useAppInitializer = () => {
  useEffect(() => {
    // Initialize API base URL from localStorage when app starts
    api.initializeApiBase();
  }, []);
};

// Or as a component that you can add to your _app.js or layout
export const AppInitializer = ({ children }) => {
  useAppInitializer();
  return children;
};

export default useAppInitializer;
