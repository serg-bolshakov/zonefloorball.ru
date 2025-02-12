<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
    
    <div class="header-admin__addProduct-choiceLine">
        <button class="header-button__make-sticker">Заметка</button>
        <p id="pElemHeaderButtonMakingStickerText">На нашем сайте вы можете оставить для себя заметку на будущее (или несколько "стикеров"): написать свой текст и оставить здесь. Заметку можно разместить в удобном месте экрана - просто перетащите её мышкой. Текст видите только вы. Двойной клик левой кнопкой мыши удалит текущую заметку.</p>    
        <?php if(empty($_GET && !empty($_GET['getproducts']))) : ?>
            <a href="<?= '?getproducts=all' ?>"><button class="admin-button__commons">Список товаров</button></a>
        <?php endif; ?>      
        <?php if(empty($_GET && !empty($_GET['getorderdhistory']))) : ?>
            <a href="<?= '/lk?getorders=all' ?>"><button class="admin-button__commons">Мои заказы</button></a>
        <?php endif; ?> 
    </div>

    @if(!empty($getRequest) && $getRequest == 'getproducts' && $getRequestValue == 'all')
    <x-lk.table-products />
    @elseif(($getRequest == 'getorders' && $getRequestValue == 'all') || ($getRequest == 'orderactionselected' && $getRequestValue == 'order-check-content'))
    <x-package.orders />
    @endif
    

    <div class="cardProduct-line__block"> 
        <div class="cardProduct-block__title">    
          <h1>Личный кабинет</h1>
          {{ $persInfo->pers_name }}&nbsp;{{ $persInfo->pers_surname }}
          <h1>Контактный номер: </h1>
          {{ $persInfo->pers_tel }}
        </div>
        <div class="avatarka-block">    
          <h4>Есть вопросы?</h4> <p>Ваш флорбольный эксперт:</p>
          <div id="avatarkaimg" class="avatarka"></div>
          <p class="manager-name">Сергей Большаков</p>
          <div class="contacts-social">
          <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте"></a>
          <a href="https://vk.com/unihoczonerussia"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте"></a>
          <a href="whatsapp://send?phone=+79534156010" title="Написать в Whatsapp"
            ><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp">
          </a>
          <a href="https://t.me/unihoczonerussia/"
            ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram">
          </a>
          <a href="viber://chat?number=%2B79534156010" title="Написать в Viber"><img src="/storage/icons/viber-logo-colored.jpg" alt="viber-logo" title="Написать в Viber"></a>
          <a href="tel:+79107955555" title="Позвонить директору"><img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору"></a>
        </div>
      </div>
    </div>

</x-maket-main>