// resources/js/Components/PickupPointSelector.tsx - компонент выбора склада
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/Constants/api";

interface IWarehouse {
    id: number;
    name: string;
    address: {
      city: string;
      street: string;
      placement: string;
    };
    metadata: {
      work_hours: string;
    };
}

const PickupPointSelector = () => {
    const [points, setPoints] = useState<Array<{
      id: number;
      name: string;
      address: string;
      workHours: string;
    }>>([]);
  
    useEffect(() => {
        fetch(API_ENDPOINTS.WAREHOUSES)
          .then(res => res.json())
          .then((data: IWarehouse[]) => {
            setPoints(data.map(wh => ({
              id: wh.id,
              name: wh.name,
              address: `${wh.address.city}, ${wh.address.street}, ${wh.address.placement}`,
              workHours: wh.metadata.work_hours
            })));
          })
          .catch(error => console.error('Ошибка загрузки складов:', error));
      }, []);
  
    return (
      <select>
        {points.map(point => (
          <option key={point.id} value={point.id}>
            {point.name} ({point.address}, {point.workHours})
          </option>
        ))}
      </select>
    );
  };