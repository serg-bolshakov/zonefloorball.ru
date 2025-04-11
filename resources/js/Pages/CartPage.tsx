// resources/js/Pages/CartPage.tsx
import useAppContext from "@/Hooks/useAppContext";
import { useUserDataContext } from "@/Hooks/useUserDataContext";
import axios from "axios";
import { getCookie } from "@/Utils/cookies";                        // Хелпер для получения CSRF-токена
import MainLayout from "@/Layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useEffect, useState, useMemo } from "react";
import { getErrorMessage } from "@/Utils/error";
import { IProduct } from "@/Types/types";
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from "@/Utils/priceFormatter";
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { useCallback } from "react";
import NavBarBreadCrumb from "@/Components/NavBarBreadCrumb";

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
}

const CartPage: React.FC<IHomeProps> = ({title, robots, description, keywords}) => {
    const { user } = useAppContext();
    const { favorites } = useUserDataContext();
    const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toastConfig = {
        position: "top-right" as const,
        autoClose: 3000, // Уведомление закроется через секунду
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

    return (    
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <NavBarBreadCrumb />
        </MainLayout>
    );
            
};

export default CartPage;