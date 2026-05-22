import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [selected, setSelected] = useState(null);

    const { user } = useAuth(); // Detect login/logout

    const fetchHistory = async () => {
        try {
            const { data } = await api.get("/ai/history");
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch history");
        }
    };

    // Reset + refetch when user changes
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);      // clear old user's history
            setSelected(null);   // clear open preview
        }
    }, [user]);

    return (
        <HistoryContext.Provider
            value={{
                history,
                setHistory,
                fetchHistory,
                selected,
                setSelected,
            }}
        >
            {children}
        </HistoryContext.Provider>
    );
};