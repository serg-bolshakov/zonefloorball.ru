// resources/js/Pages/Profile/Index.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '@/Components/NavBarBreadCrumb';
import MainLayout from '@/Layouts/MainLayout';
import useAppContext from "@/Hooks/useAppContext";
import { useUserDataContext } from "@/Hooks/useUserDataContext";
import useModal from "@/Hooks/useModal";
// import { usePage } from '@inertiajs/react';
// import axios from 'axios';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import UserProfile from '@/Components/Profile/UserProfile';

interface IProfileProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    priceDiscountAccordingToTheRank: number;
}

const Index: React.FC<IProfileProps> = ({title, robots, description, keywords, priceDiscountAccordingToTheRank}) => {
    const { openModal, closeModal } = useModal();
    console.log('Profile/Index.tsx', priceDiscountAccordingToTheRank);
    

return (
        <>
            <MainLayout>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                    <meta name="keywords" content={keywords} />
                    <meta name="robots" content={robots} />
                </Helmet>

                <main>
                    <UserProfile priceDiscountAccordingToTheRank={priceDiscountAccordingToTheRank} />
                </main>

            </MainLayout>    
        </>
    );

};

export default Index;