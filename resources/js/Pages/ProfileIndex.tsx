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

interface IRepresentPerson {
    org_rep_name?: string;
    org_rep_surname?: string;
    org_rep_email?: string;
    org_rep_phone?: string;
}

interface IProfileProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    priceDiscountAccordingToTheRank: number;
    representPerson?: IRepresentPerson | null; // Опционально, может быть null
}

const ProfileIndex: React.FC<IProfileProps> = ({title, robots, description, keywords, priceDiscountAccordingToTheRank, representPerson}) => {
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
                    <UserProfile user={user} priceDiscountAccordingToTheRank={priceDiscountAccordingToTheRank} representPerson={representPerson} />
                </main>

            </MainLayout>    
        </>
    );

};

export default ProfileIndex;