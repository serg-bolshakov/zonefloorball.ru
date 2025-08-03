import { Link } from '@inertiajs/react';

const MainShowcase = () => {
    return (
        <>   
            <section className="main-content__products">
                <div className="main-content__products-type">
                    {/* <img className="main-content__image" src="/storage/images/main/sticks.jpg" alt="sticks" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/sticks.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/sticks.jpg"
                            className="main-content__image"
                            alt="sticks"
                        />
                    </picture>
                    <div className="main-content__item">
                        <Link href="products/sticks/">КЛЮШКИ</Link>
                    </div>
                </div>  

                <div className="main-content__products-type">
                    {/* <img className="main-content__image" src="/storage/images/main/blades.jpg" alt="blades" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/blades.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/blades.jpg"
                            className="main-content__image"
                            alt="blades"
                        />
                    </picture>
                    <div className="main-content__item">
                        <Link className="main-content__item" href="/products/blades/">КРЮКИ</Link>
                    </div>
                </div>  

                <div className="main-content__products-type">
                    {/* <img className="main-content__image" src="/storage/images/main/grips.jpg" alt="grips" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/grips.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/grips.jpg"
                            className="main-content__image"
                            alt="grips"
                        />
                    </picture>
                    <div className="main-content__item">
                     <h2><Link href="/products/grips/">ОБМОТКИ</Link></h2>
                    </div>
                </div>  
                
                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/main/shoes.jpg" alt="shoes" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/shoes.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/shoes.jpg"
                            className="main-content__image"
                            alt="shoes"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <h2 className="main-content__products-text">ОБУВЬ</h2>
                    </div>
                </div>

                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/showcase/showcase-goalkeepers.png" alt="goalie" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/showcase/showcase-goalkeepers.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/showcase/showcase-goalkeepers.jpg"
                            className="main-content__image"
                            alt="goalie"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <Link href="/products/goalie"><h2 className="main-content__products-text">ВРАТАРСКАЯ ЭКИПИРОВКА</h2></Link>
                    </div>
                </div>  

                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/showcase/showcase-eyewear.png" alt="eyewear" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/showcase/showcase-eyewear.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/showcase/showcase-eyewear.jpg"
                            className="main-content__image"
                            alt="eyewear"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <Link href="/products/eyewears/"><h2 className="main-content__products-text">ОЧКИ</h2></Link>
                    </div>
                </div>

                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/main/apparel.jpg" alt="apparel" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/apparel.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/apparel.jpg"
                            className="main-content__image"
                            alt="apparel"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <h2 className="main-content__products-text">ОДЕЖДА</h2>
                    </div>
                </div>

                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/showcase/showcase-bags.png" alt="bags" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/showcase/showcase-bags.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/showcase/showcase-bags.png"
                            className="main-content__image"
                            alt="bags"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <h2 className="main-content__products-text">СУМКИ ЧЕХЛЫ</h2>
                    </div>
                </div>

                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/main/accessories.jpg" alt="accessories" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/accessories.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/accessories.jpg"
                            className="main-content__image"
                            alt="accessories"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <h2 className="main-content__products-text">АКСЕССУАРЫ</h2>
                    </div>
                </div>
                
                <div className="main-content__products-container">
                    {/* <img className="main-content__image" src="/storage/images/main/basic-collection.jpg" alt="basic-collection" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/basic-collection.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/basic-collection.jpg"
                            className="main-content__image"
                            alt="basic-collection"
                        />
                    </picture>
                    <div className="main-content__products-overlay">
                        <h2 className="main-content__products-text">ВОРОТА И МЯЧИ</h2>
                    </div>
                </div>
            </section>  

            <div className="line-horizontal"></div>

            <section className="main-content">
                <div className="main-content__images">
                    {/* <img className="main-content__image" src="/storage/images/main/floorball-pro_708x472.jpeg" alt="proffesionals" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/floorball-pro_708x472.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/floorball-pro_708x472.jpeg"
                            className="main-content__image"
                            alt="proffesionals"
                        />
                    </picture>
                    <p>Для профессионалов...</p>
                    <div className="pop-up__main-content">
                        <img className="main-content__icons-position" src="/storage/icons/about.png" alt="icon about" />
                        <div className="pop-up__main-content-targets">
                            <p>Для тех, кому флорбол стал частью жизни! Здесь ты найдёшь для себя всё то, что поможет тебе стать лучшим игроком. Всё остальное зависит только от тебя.
                            <br />&nbsp;<br />Продукция Unihoc и Zonefloorball. - выбор ведущих игроков мира, чемпионов мира и... твой выбор... Будь игроком нашей команды!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="main-content__images">
                    {/* <img className="main-content__image" src="/storage/images/main/floorball-girls_708x473.jpeg" alt="floorball-friends" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/floorball-girls_708x473.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/floorball-girls_708x473.jpeg"
                            className="main-content__image"
                            alt="floorball-friends"
                        />
                    </picture>
                    <p>любителей...</p>
                    <div className="pop-up__main-content">
                        <img className="main-content__icons-position" src="/storage/icons/about.png" alt="icon about" />
                        <div className="pop-up__main-content-targets">
                            <p>Нам по пути, если тебе не светят олимпийские горизонты, если ты просто получаешь удовольствие от игры и всего того, что её окружает.
                            <br />&nbsp;<br />Renew Group Sweden AB - сделано с умом... профессионалами для друзей и коллег...</p>
                        </div>
                    </div>
                </div>
                        
                <div className="main-content__images">
                    {/* <img id="myImg" className="main-content__image" src="/storage/images/main/floorball-boys_708x472.jpg" alt="Для школ, ФОКов, спортсменов других видов спорта..." /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/floorball-boys_708x472.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/floorball-boys_708x472.jpg"
                            className="main-content__image"
                            alt="floorball for all"
                        />
                    </picture>
                    <p>школ, ФОКов, спортсменов других видов спорта...</p>
                    <div className="pop-up__main-content">
                        <img className="main-content__icons-position" src="/storage/icons/about.png" alt="icon about" />
                        <div className="pop-up__main-content-targets">
                            <p>Тебе больше нравится другой вид спорта? Тоже неплохо! Главное - что это спорт.
                            <br />&nbsp;<br />Флорбол - отличная игра для повышения уровня физподготовки, мастерства и средство для достижения целей и побед.
                            <br />&nbsp;<br />Классная экипировка от ведущего мирового производителя придаст уверенности и принесёт удовольствие от игры и достигнутых результатов.</p>
                        </div>
                    </div>
                </div>
                        
                <div className="main-content__images">
                    {/* <img className="main-content__image" src="/storage/images/main/floorball-parents-children_708x472.jpg" alt="самых маленьких (первая, самая лучшая клюшка)" /> */}
                    <picture>
                        {/* Добавляем проверку MIME-типа */}
                        <source 
                            srcSet="/storage/images/main/floorball-parents-children_708x472.webp" 
                            type="image/webp" 
                        />
                        {/* Финальный фолбэк */}
                        <img
                            src="/storage/images/main/floorball-parents-children_708x472.jpg"
                            className="main-content__image"
                            alt="floorball-for-beginners"
                        />
                    </picture>
                    <p>самых маленьких (первая, самая лучшая клюшка)</p>
                    <div className="pop-up__main-content">
                    <img className="main-content__icons-position" src="/storage/icons/about.png" alt="icon about" /> 
                    <div className="pop-up__main-content-targets">
                        <p>В компании Renew Group Sweden AB с одинаковым вниманием и профессионализмом, на высочайшем технологическом уровне делают инвентарь и для звёзд мирового флорбола, и для наших звёздочек.
                        <br />&nbsp;<br />Для того, чтобы ребёнок полюбил физкультуру и спорт, <i>захотел</i> играть в флорбол, клюшка должна быть &laquo;правильной&raquo;. Тогда деньги будут потрачены не зря, вы увидите радость на лицах своих детей и желание играть.
                        </p>
                    </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default MainShowcase;