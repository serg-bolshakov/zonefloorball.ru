// resources/js/Components/ProductCard/StatusBlock.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IStatusBlock {
    productReport:  IProductCardResponse['prodInfo']['productReport'];
    productUnit:    IProductCardResponse['prodInfo']['productUnit'];
}

const StatusBlock: React.FC<IStatusBlock> = ({ productReport, productUnit }) => {
  
  return (
    <>
        { productReport.on_sale !== undefined ? (
            productReport.on_sale > 0 ? (
                <div className="card-product__detail-status">В продаже:<br /> { productReport.on_sale }&nbsp;{ productUnit.unit_prod_value_view }</div>
                ) : (
                    <div className="card-product__detail-status">В продаже<br />временно нет</div>
                )
            ) : null
        }    
            
        { productReport.coming_soon !== undefined ? (
            productReport.coming_soon > 0? (
                <div className="card-product__detail-status">Ожидается</div>
                ) : (
                    null
                )
            ) : (
                null
            )
        }

        { productReport.reserved !== undefined ? (
            productReport.reserved > 0? (
                <div className="card-product__detail-status">Резерв:<br />{ productReport.reserved }&nbsp;{ productUnit.unit_prod_value_view }</div>
                ) : (
                    null
                )
            ) : (
                null
            )
        }

        { productReport.on_preorder !== undefined ? (
            productReport.on_preorder > 0? (
                <div className="card-product__detail-status">На заказ:<br />{ productReport.on_preorder }&nbsp;{ productUnit.unit_prod_value_view }</div>
                ) : (
                    null
                )
            ) : (
                null
            )
        }
    </>
  );
};

export default StatusBlock;