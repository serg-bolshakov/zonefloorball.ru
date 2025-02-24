<div>
    <!-- Because you are alive, everything is possible. - Thich Nhat Hanh -->
</div>

<footer class="footer">
  <div class="footer-block">
    <h2>АССОРТИМЕНТ</h2>
    
    @foreach($categoriesMenuArr as $category)
      @if(isset($category[0]))
      <a href="/products/{{ $category[0]->url_semantic }}/">{{ $category[0]->category_view_2 }}</a>  
      @endif
    @endforeach

  </div>

  <div class="footer-block">
    <h2>ИНФОРМАЦИЯ</h2>
    <!-- <div class="pop-up__footer-hint">О нас
      <div class="pop-up__footer-hint-text">
        <x-articles.about-us />
      </div>
    </div> -->
    <!-- <button class="modal-trigger" data-modal="about-us">О нас</button>
    <br>  -->

    <!-- Ссылка "О нас" -->
    <a href="#about-us" class="modal-link">О нас</a>
        
    <!-- <div class="pop-up__footer-hint">Оплата и доставка товаров
      <div class="pop-up__footer-hint-text">
      <x-articles.payment-and-delivery />
      </div>
    </div> -->
    <!-- <button class="modal-trigger" data-modal="payment-delivery">Оплата и доставка товаров</button>
    <br> -->

    <!-- Ссылка "Оплата и доставка" -->
    <a href="#payment-delivery" class="modal-link">Оплата и доставка товаров</a>
        
    <!-- <div class="pop-up__footer-hint">Обмен и возврат товаров
      <div class="pop-up__footer-hint-text">
      <x-articles.products-return-and-exchange />
      </div>
    </div> -->

    <!-- <button class="modal-trigger" data-modal="return-exchange">Обмен и возврат товаров</button> -->
    <!-- Ссылка "Обмен и возврат" -->
    <a href="#return-exchange" class="modal-link">Обмен и возврат товаров</a>

    <p>Чем отличаются наши товары</p>
    <p>Где посмотреть и как купить</p>
    <p>Подбор товаров и экипировки</p>
    <p>Подписка на новости</p>
    <p><a href="/sitemap">Карта сайта</a></p>

    <!-- Модальное окно "О нас" -->
    <div id="about-us" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.about-us />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>

    <!-- Модальное окно "Оплата и доставка" -->
    <div id="payment-delivery" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.payment-and-delivery />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>

    <!-- Модальное окно "Обмен и возврат" -->
    <div id="return-exchange" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.products-return-and-exchange />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>
  </div>

  <div class="footer-block">
    <h2>СТАТЬИ И ЗАМЕТКИ</h2>

    <a href="#about-flex" class="modal-link">Про жёсткость (флекс)</a>
    <div id="about-flex" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.shaft-flex />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>

    <a href="#hook-side" class="modal-link">Как правильно определить хват</a>
    <div id="hook-side" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.hook-side />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>

    <a href="#shaft-length" class="modal-link">Как подобрать клюшку</a>
    <div id="shaft-length" class="modal">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <x-articles.shaft-length />
            <!-- Стрелочка вверх -->
            <div class="scroll-to-top">&#9650;</div>
        </div>
    </div>
    
    <p>Технологии рукояток</p>
    <p>Длина рукоятки/клюшки/габарит</p>
    <p>Какая клюшка крепче и прочнее</p>
    <p>Немного о крюках (перьях...)</p>
    <p>Сборка и компоновка клюшек</p>
    <p>Разное (ответы на вопросы)</p>
  </div>
      
  <div class="footer-block">
    <h2>ПОДДЕРЖКА ПОКУПАТЕЛЕЙ</h2>
    <div class="contacts-social">
      <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте"></a>
      <a href="https://vk.com/unihoczonerussia"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте"></a>
      <a href="whatsapp://send?phone=79534156010" title="Написать в Whatsapp"
        ><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp">
      </a>
      <a href="https://t.me/unihoczonerussia/"
        ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram">
      </a>
      <a href="viber://chat?number=%2B79534156010" title="Написать в Viber"><img src="/storage/icons/viber-logo-colored.jpg" alt="viber-logo" title="Написать в Viber"></a>
      <!--<a href=""
        ><img src="icons/youtube-logo-colored-250x250.png" alt="youTube-logo"
      /></a>-->
      <a href="tel:+79107955555" title="Позвонить директору"><img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору"></a>
    </div>
      <!-- <div class="paymentDelivery-methods">
        <p><img src="icons/master-card.png" alt="master-card"></p>
        <p><img src="icons/visa-card.png" alt="visa-card"></p>
      
        <p>
          <img src="icons/russianPost-logo.png" alt="russianPost-logo">
        </p>
      </div> -->
      
      <div class="footer-auth__div">
        <!-- <p><a href="#how-does-it-work" class="modal-link">Сделано</a>&nbsp;<a href="mailto:serg.bolshakov@gmail.com">Большаковым&nbsp;Сергеем</a>, 2023-<?= date('Y'); ?></p> -->
        <p class="margin-bottom12px">Сделано&nbsp;<a href="mailto:serg.bolshakov@gmail.com">Большаковым&nbsp;Сергеем</a>, 2023-<?= date('Y'); ?></p>
        <p>Демоверсия 0.0.5 <a href="https://github.com/serg-bolshakov/unihoczone.ru"><span class="header-icon">Посмотреть<span></a> исходный код.</p>
        <p class="margin-bottom12px">Буду рад сотрудничеству&nbsp;(<a href="/storage/docs/resume.pdf"><span class="cursive header-icon">resume.pdf</span></a><span class="cursive">, 68 Кб</span>) — <br><span class="cursive">Обновлено 24.02.2025 г.</span></p>
        <p><a href="https://floorball.nnov.ru/htdocs/shop/">Перейти на сайт&nbsp;</a>флорбольной экипировки</p>
        <p>или в наш флорбольный <a href="https://floorball.nnov.ru/market/floorball-sticks">Интернет-магазин&nbsp;</a></p>
      </div>
      
      <div id="how-does-it-work" class="modal">
          <div class="modal-content">
              <span class="modal-close">&times;</span>
              <x-articles.how-does-it-work />
              <!-- Контейнер для стрелочки -->
              <div class="scroll-to-top-container"><div class="scroll-to-top">&#9650;</div></div>    
              
          </div>
      </div>
  </div>   

  <script src="{{ asset('js/footer.js') }}"></script>
  
</footer>