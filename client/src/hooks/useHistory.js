import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/history";

export function useHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(API_URL);
            if (data.success) {
                setHistory(data.history || []);
            } else {
                throw new Error(data.error || "Failed to fetch history");
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Failed to load history";
            setError(msg);
            console.error("[useHistory] Error:", msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        loading,
        error,
        refresh: fetchHistory,
    };
}
