// resources/js/Pages/ProfileIndex.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '@/Components/NavBarBreadCrumb';
import MainLayout from '@/Layouts/MainLayout';
import useAppContext from "@/Hooks/useAppContext";
import { useUserDataContext } from "@/Hooks/useUserDataContext";
import useModal from "@/Hooks/useModal";
// import { usePage } from '@inertiajs/react';
// import axios from 'axios';
import UserProfile from '@/Components/Profile/UserProfile';

interface IProfileProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    priceDiscountAccordingToTheRank: number;
}

const ProfileIndex: React.FC<IProfileProps> = ({title, robots, description, keywords, priceDiscountAccordingToTheRank}) => {
    const { openModal, closeModal } = useModal();
    const { user } = useAppContext();
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
                    <UserProfile user={user} priceDiscountAccordingToTheRank={priceDiscountAccordingToTheRank} />
                </main>

            </MainLayout>    
        </>
    );

};

export default ProfileIndex;