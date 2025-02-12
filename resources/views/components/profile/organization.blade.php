<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
    
    <div class="header-admin__addProduct-choiceLine">
        <a href="/profile"><button class="admin-button__commons">Меню профиля</button></a>
        <!-- <button class="header-button__make-sticker">Заметка</button> -->
        <p id="pElemHeaderButtonMakingStickerText">На нашем сайте вы можете оставить для себя заметку на будущее (или несколько "стикеров"): написать свой текст и оставить здесь. Заметку можно разместить в удобном месте экрана - просто перетащите её мышкой. Текст видите только вы. Двойной клик левой кнопкой мыши удалит текущую заметку.</p>    
        <?php if(!isset($_GET['getproducts'])) : ?>
            <a href="<?= '?getproducts=all' ?>"><button class="admin-button__commons">Список товаров</button></a>
        <?php endif; ?>      
        <?php if(!isset($_GET['getorders'])) : ?>
            <a href="<?= '/profile?getorders=all' ?>"><button class="admin-button__commons">Мои заказы</button></a>
        <?php endif; ?> 
    </div>

    @if((!empty($getRequest) && $getRequest == 'getorders' && $getRequestValue == 'all') || (!empty($getRequest) && $getRequest == 'orderactionselected' && $getRequestValue == 'order-check-content'))
    <x-package.orders />
    @elseif(!empty($getRequest) && $getRequest == 'getproducts' && $getRequestValue == 'all')
    <x-profile.table-products />
    @endif

    <div class="cardProduct-line__block"> 
        <div class="cardProduct-block__title">    
          <div>
            <div class="cardProduct-block__title margin-bottom24px">
                <h1 class="fs12">Это моя любимая компания</h1>
                <h4 class="fs12">Наша партнёрская скидка в UnihocZoneRussia <font color="red"><srtong>{{ $priceDiscountAccordingToTheRank }}</strong></font> %</h4>
            </div>
            
            <div class="profile-info__line--title flex-sb fs11">
                <p id="nameprofilechangingspan">{{ $orgInfo->name }}</p>&nbsp;
                <p><img src="/storage/icons/edit.png" id="editnameslogoinprofile" alt="edit-logo" title="Редактировать наименование фирмы"></p>
            </div>
      
            <div id="profilechangingnamesdiv" class="profile-changing-form margin-bottom8px">
              <h6 class="color-red">Корректируем Наименование организации</h6>
              <form action="" method="POST">
                  @csrf  
                  <p class="registration-form__input-item">
                      <input id="nameprofilechanging" class="registration-form__input margin-tb4px" type="text" required  data-rule="nameorgfieldtext" data-maxlength="255" name="editinprofileorgname" value="{{ old('name') }}" autofocus autocomplete="name">
                      <span class="registration-error">*<br>@error('editinprofileorgname') {{ $message }} @enderror</span>
                      <span class="productAddition-form__clearance">Наименование организации указывается в соответствии с учредительными документами.</span><br>
                      <span id="profileediterrorname" class="registration-error"></span>
                  </p>

                  <input type="checkbox" id="checkchangingorgnameaddringprofile" hidden name="checkchangingorgnameaddringprofile" value="yes">
                    <label for="checkchangingorgnameaddringprofile" class="fs12">Я не робот</label>
                    
                  
                  <div class="d-flex flex-sa">
                      <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                      <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                  </div>
              </form>
            </div>

            <div class="profile-info__line--title flex-sb fs11"> 
                <p>Карточка предприятия</p>
                <p id="pElemForOpenIconImg"><img src="/storage/icons/search.png" id="checkcompanyinfoinprofileicon" alt="search-logo" title="Посмотреть контактную информацию"></p>
                <p id="pElemForCloseIconImg" class="d-none"><img src="/storage/icons/icon-close.png" id="closecheckingcompanyinfoinprofileicon" alt="close-logo" title="Закрыть просмотр контактноу информацию"></p>
            </div>
            <div id="companycarddivinprofile" class="d-none">
                <div class="profile-user__card--div">
                    <div class="profile-info__line--title flex-sb"> 
                        <h4 class="fs11 margin-left12px margin-tb12px">ИНН: {{ $orgInfo->org_inn }}</h4>
                        <h4 class="fs11 margin-left12px margin-tb12px">КПП: {{ $orgInfo->org_kpp }}</h4>
                    </div>
                </div>

                <div class="profile-user__card--div">
                    <div class="profile-info__line--title flex-sb"> 
                        <h4 class="margin-left12px fs11">Юридический адрес: </h4>
                        <p><img src="/storage/icons/edit.png" id="editorgaddresslogoinprofile" alt="edit-logo" title="Изменить юридический адрес"></p>
                    </div>
                    <div class="profile-info__line margin-left12px fs11">
                        <span>{!! $orgInfo->org_addr !!}</span>
                    </div>
                </div>
                <div id="profilechangingorgaddressdiv" class="profile-changing-form margin-tb12px">
                <form action="" method="POST">
                    @csrf  
                    <div id="editorgaddressfieldinprofile" class="registration-form__input-item margin-tb4px">
                        <label class="fs12 color-red margin-left12px" for="editorgaddressfieldinprofilediv">Редактируем юридический адрес!</label>
                        <div contenteditable="true" id="editorgaddressfieldinprofilediv" class ="registration-form__input-address margin-left12px margin-tb12px" data-rules="addressfieldtext">@if(!empty($orgInfo->org_addr)){!! $orgInfo->org_addr !!}@endif</div>
                        <span class="registration-error">@error('editorgaddrinprofile') {{ $message }} @enderror</span>
                        <span class="productAddition-form__clearance">Указывается в соответствии с учредительными документами.</span><br>
                        <span id="editinprofileerroraddr" class="registration-error">@if($errors->has('checkchangingaddringprofile')) {{ $errors->first('checkchangingaddringprofile') }} @endif</span>
                    </div>

                    <input id="editorgaddressfieldinprofileinput" type="hidden" name="editorgaddrinprofile" value="@if(!empty($orgInfo->org_addr)){!! $orgInfo->org_addr !!}@endif">

                    <input type="checkbox" id="checkchangingaddringprofile" hidden name="checkchangingaddringprofile" value="yes">
                    <label for="checkchangingaddringprofile" class="fs12">Я не робот</label>
                    <p id="checkchangingaddringprofileerr" class="registration-error"></p>

                    <div class="d-flex flex-sa">
                        <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                        <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                    </div>
                </form>
                </div> 
                <div class="profile-user__card--div">
                    <div class="profile-info__line--title flex-sb"> 
                        <h4 class="margin-left12px fs11">Номер телефона:</h4>
                        <p><img src="/storage/icons/edit.png" id="editorgtelnuminprofile" alt="edit-logo" title="Редактировать номер телефона"></p>
                    </div>
                    <div class="profile-info__line margin-left12px fs11">
                        <span>{{ $orgInfo->org_tel }}</span>
                    </div>

                    <div id="profilechangingorgtelnumdiv" class="profile-changing-form margin-bottom8px">
                        <form action="" method="POST">
                            @csrf  
                            <label class="fs12" for="inputprofilecahngingorgtelnum">Меняем номер телефона: </label>
                            <input id="inputprofilecahngingorgtelnum" class="registration-form__input margin-tb4px" type="tel" required placeholder="+7 (999) 123-45-67" name="editorgtelnum" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value="<?php if (isset ($_POST['editorgtelnum'])) echo $_POST['editorgtelnum'] ?>">
                            <span class="registration-error">*<br></span>
                            <span class="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span><br>
                            <span id="profilechangingerrororgtelnum" class="registration-error"></span>
                            
                            <div class="d-flex flex-sa">
                                <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                                <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                            </div>
                        </form>
                    </div> 
                </div>

                <div class="profile-user__card--div">
                    <h4 class="fs11 margin-left12px">Представитель (контактное лицо): </h4>
                    <div class="profile-info__line fs12 margin-left12px">
                        <div class="profile-info__line--title flex-sb"> 
                            <p>{{ $representPerson->name }} {{ $representPerson->pers_surname }}</p>    
                            <p><img src="/storage/icons/search.png" id="checkrepresentprofileimg" alt="search-logo" title="Информация о представителе компании"></p>
                        </div>
                    </div>
                </div>

                <div id="profilecheckreperesentdiv" class="profile-checking-form margin-bottom8px">
                    <div class="profile-user__card--div">
                        <h4 class="fs11 margin-left12px margin-tb12px">Телефон: {{ $representPerson->pers_tel }}</h4>
                        <h4 class="fs11 margin-left12px margin-tb12px">email: {{ $representPerson->	pers_email }}</h4>
                    </div>
                </div> 
            </div>

            <div class="profile-info__line">
              <a href="/update-password"><button type="submit" class="forgot-password__form--btn">Сменить пароль</button></a>
            </div>

            <div class="profile-info__line">
              <a href="/update-email"><button type="submit" class="forgot-password__form--btn">Сменить почту (логин)</button></a>
            </div>
            
          </div>
        </div>
        
        <div class="avatarka-block">    
          <h4>Есть вопросы?</h4> <p>Ваш флорбольный эксперт:</p>
          <div id="avatarkaimg" class="avatarka"></div>
          <p class="manager-name">Сергей Большаков</p>
          <div class="profile-info__line">
          <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте"></a>
          <a href="https://vk.com/unihoczonerussia"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте"></a>
          <a href="whatsapp://send?phone=+79534156010" title="Написать в Whatsapp"
            ><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp">
          </a>
          <a href="https://t.me/unihoczonerussia/"
            ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram">
          </a>
          <!-- <a href="viber://chat?number=%2B79534156010" title="Написать в Viber"><img src="/storage/icons/viber-logo-colored.jpg" alt="viber-logo" title="Написать в Viber"></a> -->
          <a href="tel:+79107955555" title="Позвонить директору"><img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору"></a>
        </div>
      </div>
    </div>
    <script src="{{ asset('js/profile-org-validator.js') }}"></script>
    <script src="{{ asset('js/profile-org-changing.js') }}"></script>
</x-maket-main>