import { useEffect, useState } from "react";

export default function ToggleDark() {
    const [dark, setDark] = useState(() => {
        // Kiểm tra localStorage trước
        return localStorage.getItem("dark-mode") === "true" || false;
    });

    useEffect(() => {
        const html = document.documentElement;
        if (dark) {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
        localStorage.setItem("dark-mode", dark.toString());
    }, [dark]);

    return (
        <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded bg-primary text-background hover:opacity-80 transition"
        >
            {dark ? "🌙 Dark" : "☀️ Light"}
        </button>
    );
}
