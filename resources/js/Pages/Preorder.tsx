// resources/js/Pages/Preorder.tsx

import { ITransport } from "@/Types/delivery";
import { OrderProcess } from "@/Components/OrderProcess/OrderProcess";
 
interface IPreorderProps {  
    title: string;
    robots: string;
    description: string;
    keywords: string;
    transports: ITransport[];
}

const Preorder = (props: IPreorderProps) => {
    return <OrderProcess mode="preorder" {...props} />;
};

export default Preorder;