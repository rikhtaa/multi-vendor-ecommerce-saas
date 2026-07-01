import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { isProtected } from "../utils/protected";

const fetchUser = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/logged-in-user",
            isProtected
        );
        return response.data.user ?? null;
    } catch {
        return null;
    }
};

const useUser = () => {
    const query = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return {
        user: query.data,
        isLoading: query.isPending,
        isError: query.isError,
    };
};

export default useUser;