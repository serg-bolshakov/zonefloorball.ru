// resources/js/Pages/ProductCard.tsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from '@inertiajs/react';
import { Helmet } from 'react-helmet';
import MainLayout from '../Layouts/MainLayout';
import { IProductCardResponse } from '@/Types/prodcard';
import useModal from '@/Hooks/useModal';
import IFF from '@/Components/Articles/IFF';

const ProductCard: React.FC<IProductCardResponse> = ({title, robots, description, keywords, prodInfo}) => {
    
    // Функция для форматирования цены
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    try {
        const { openModal } = useModal();

        return (
            <MainLayout>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                    <meta name="keywords" content={keywords} />
                    <meta name="robots" content={robots} />
                </Helmet>

                <main>
                    <section className="cardProduct-line__block"> 
                        <div className="cardProduct-block__title">    
                            <h1>{ prodInfo.title }</h1>
                        </div>
                        <div className="cardProduct-block__logo-article">
                            { prodInfo.brand_id  && ( 
                                <img className="cardProduct-logo" src={`/storage/${ prodInfo.brand.url }`} alt={` ${prodInfo.brand.brand_view } logo`} title={` ${prodInfo.brand.brand_view} logo`} />
                            )}
                            <p className="cardProduct-article__title">Артикульный<br />номер:</p>
                            <p className="cardProduct-article__number">{ prodInfo.article }</p>
                        </div>
                    </section>

                    <section className="cardProduct-line__block">
                        { prodInfo.productMainImage.img_link && (
                            <Link href={`/storage/${ prodInfo.productMainImage.img_link }`}>
                                <img className={`cardProduct__mainImg--${ prodInfo.productCardImgOrients.img_orient }`} 
                                    src={`/storage/${ prodInfo.productMainImage.img_link }`} 
                                    alt={[prodInfo.category.category, prodInfo.brand.brand_view, prodInfo.model, prodInfo.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')} 
                                    title="Кликни на изображение, чтобы посмотреть его на всём экране."
                                />
                            </Link>
                        )}

                        <section className="cardProduct-props">
                            <div className="cardProduct-props__item">
                                {/* <x-product-card.block-other-possible-prods-for-card /> */}
                            </div>

                            {prodInfo.actualPrice && (
                                <section className="cardProduct-productPrice__block">
                                    <div>Лучшая цена:</div>

                                    { prodInfo.actualPrice.price_value && prodInfo.regularPrice.price_value &&
                                      prodInfo.actualPrice.price_value !== null && prodInfo.regularPrice.price_value !== null && 
                                      prodInfo.actualPrice.price_value !== undefined && prodInfo.regularPrice.price_value !== undefined ? (

                                        prodInfo.actualPrice.price_value < prodInfo.regularPrice.price_value ? ( 
                                            <>
                                                <div className="cardProduct-priceCurrentSale nobr">
                                                    {formatPrice(prodInfo.actualPrice.price_value)} <sup>&#8381;</sup>
                                                </div>
                                                <div className="cardProduct-priceBeforSale nobr">
                                                    {formatPrice(prodInfo.regularPrice.price_value)} <sup>&#8381;</sup>
                                                </div>
                                                <div className="cardProduct-priceDiscountInPercentage nobr">
                                                    - {Math.ceil(100 - (prodInfo.actualPrice.price_value / prodInfo.regularPrice.price_value) * 100)}%
                                                </div>
                                            </>
                                        ) : (
                                             <div className="cardProduct-priceCurrent nobr">{formatPrice(prodInfo.regularPrice.price_value)} <sup>&#8381;</sup></div>
                                        )
                                      ) : <div className="cardProduct-priceCurrent nobr">К сожалению, цена не актуальна</div>
                                    }

                                    { prodInfo.actualPrice.date_end && ( 
                                        <div className="cardProduct-priceValidPeriod nobr">действует до: { prodInfo.actualPrice.date_end }</div>
                                    )}
                                </section>
                            )}
                                
                            <div className="card-product__detail-status-block">
                            {/* @if($data)
                                @if ($data['productReport']->on_sale)
                                    <div class="card-product__detail-status">В продаже:<br> {{ $data['productReport']->on_sale }}&nbsp;{{ $data['productUnit']->unit_prod_value_view }}</div>
                                    @else
                                    <div class="card-product__detail-status">В продаже<br>нет</div>
                                    @if($data['productReport']->coming_soon)
                                        <div class="card-product__detail-status">Скоро будет</div>
                                    @endif
                                @endif

                                @if($data['productReport']->reserved)
                                    <div class="card-product__detail-status">Резерв:<br> {{ $data['productReport']->reserved }}&nbsp;{{ $data['reservedProductUnitValueView'] }}</div>
                                @endif
                            @else>
                                <div class="card-product__detail-status">В архиве</div>
                            @endif

                            @if($data)
                                <img id="buttonFromProductCardPutProductForFavorites" src="/storage/icons/favorite.png" alt="favorite-logo" title="Добавить в избранное">
                            @endif
                                
                            @if($data['productReport']->on_sale)
                                <button id="buttonFromProductCardPutProductForBasket" class = "card-product__basket-button" value="В корзину">В корзину</button>
                            @endif 
                                
                            <input id="hiddenInputFromProductCardWithInfoForBasket" type="hidden" data-productid="{{ $data->id }}" data-productarticle="{{ $data->article }}" 
                                data-productname="{{ $data->title }}" data-productpriceactual="{{ $data['actualPrice']->price_value }}" 
                                data-productquantityonsale="{{ $data['productReport']->on_sale }}" data-producturlsemantic="{{ $data->prod_url_semantic }}"
                                data-productimglink="{{ $data['productMainImage']->img_link }}" 
                                data-productpriceregular="{{ $data['regularPrice']->price_value }}" 
                                data-productpricespecial="<?= ($data['regularPrice']->price_value == $data['actualPrice']->price_value) ? '' :  $data['actualPrice']->price_value ?>" 
                                data-productpricespecialdate="{{ $data['actualPrice']->date_end }}" 
                            name="hiddenInputFromProductCard" value=""> 

                            <script src="{{ asset('js/add-product-to-package.js') }}"></script> */}

                            </div>
                        </section>
                    </section>
                    
                    <section className="cardProduct-descDetails__block">
                        <div className="cardProduct-props">  
                            {prodInfo.prod_desc && (
                                <div className="cardProduct-description" dangerouslySetInnerHTML={{ __html: prodInfo.prod_desc }} />
                            )}
                            {prodInfo.size.size_recommendation && (
                            <div className="cardProduct-productTarget">   
                                <span> {prodInfo.size.size_recommendation }</span>
                            </div>
                            )}
                        </div>

                        <section className="cardProduct-details">
                            <div className="cardProduct-details__title">
                                <p>Спецификация товара</p>
                            </div>
            
                            { prodInfo.weight && ( 
                            <>
                                <div className="cardProduct-detail__name">Вес (г):</div>
                                <div className="cardStick-detail__value">{ prodInfo.weight }</div>
                            </>
                            )}
            
                            { prodInfo.material && (
                            <>  
                                <div className="cardProduct-detail__name">Материал:</div>
                                <div className="cardStick-detail__value">{ prodInfo.material }</div>
                            </>
                            )}
            
                            { prodInfo.iff_id && (
                            <>
                                <div className="cardProduct-detail__name pop-up__cardProduct-hint modal-link" onClick={() => openModal(<IFF />)}>Наличие сертификата IFF:</div>
                                <div className="cardStick-detail__value">{ prodInfo.iff_id === 1 ? 'Да' : 'Нет' }</div>
                            </>
                            )}

                            {prodInfo.properties && 
                                Object.values(prodInfo.properties).map(prop => (
                                    <React.Fragment key={`${prop.prop_title}_${prop.id}`}>
                                        <div className="cardProduct-detail__name">{ prop.prop_description }</div>
                                        <div className="cardProduct-detail__value">{ prop.prop_value_view }</div>    
                                    </React.Fragment>
                                ))
                            }

                            {/* { prodInfo.propSeries && (
                            <>
                                <div className="cardProduct-detail__name">Специальное направление:</div>
                                <div className="cardProduct-detail__value">{ prodInfo.propSerie.prop_value_view }</div>
                            </>
                            )}

                            { prodInfo.propCollection && (
                            <>
                                <div className="cardProduct-detail__name">Коллекция:</div>
                                <div className="cardProduct-detail__value">{ prodInfo.propCollection.prop_value_view }</div>
                            </>
                            )} */}

                        </section>

                    </section>
                    
                </main>
            </MainLayout>    
        );
    } catch(error) {
        console.error('Error in ProductCard:', error);
        return <div>Произошла ошибка при загрузке карточки товара</div>;
    }
};

export default ProductCard;