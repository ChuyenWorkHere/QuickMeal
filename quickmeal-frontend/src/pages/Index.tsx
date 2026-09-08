import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import Home from "@/pages/HomePage";

export default function Index() {
    const { role } = useAuthContext();

    console.log("Current role:", role);

    if (role === "ADMIN" || role === "STAFF") return <Navigate to="/admin/dashboard" />;
    return <Home />;
}
