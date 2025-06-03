// resources/js/Components/Profile/UserProfile.tsx

import React, { useState } from 'react';
import { TUser } from '@/Types/types';
import { isIndividualUser, isLegalUser } from '@/Types/types';
import IndividualUserFields from './IndividualUserFields';

interface UserProfileProps { user: TUser; priceDiscountAccordingToTheRank: number; }

const UserProfile: React.FC<UserProfileProps> = ({ user, priceDiscountAccordingToTheRank }) => {
    
    if (!user) return <div>Пользователь не загружен</div>;

        return (
            <div className="cardProduct-line__block"> 
                
                <div className="cardProduct-block__title"> 
                    {/* Общие блоки для всех пользователей */}
                    <div className="cardProduct-block__title margin-bottom24px">
                        <h1 className="fs11 margin-bottom8px">Личный кабинет</h1>
                        <h4 className="fs12">Моя партнёрская скидка в ZoneFloorball.RU: <span className='color-red'><strong>{priceDiscountAccordingToTheRank}</strong></span> %</h4>
                    </div>

                    {/* Условный рендеринг специфичных полей */}
                    {isIndividualUser(user) && <IndividualUserFields user={user} />}
                </div>

                <div className="avatarka-block">    
                    <h4>Есть вопросы?</h4> 
                    <p>Ваш флорбольный эксперт:</p>
                    <div id="avatarkaimg" className="avatarka"></div>
                    <p className="manager-name">Сергей Большаков</p>
                    <div className="profile-info__line">
                        <a href="mailto:unihoczonerussia@gmail.com">
                            <img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте"/>
                        </a>
                        <a href="https://vk.com/unihoczonerussia">
                            <img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте"/>
                        </a>
                        <a href="whatsapp://send?phone=+79534156010" title="Написать в Whatsapp">
                            <img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp"/>
                        </a>
                        <a href="https://t.me/unihoczonerussia/">
                            <img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram"/>
                        </a>
                        <a href="tel:+79107955555" title="Позвонить директору">
                            <img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору"/>
                        </a>
                    </div>
                </div>
            </div>
        );
};

export default UserProfile;

 {/* <div class="cardProduct-line__block"> 
        <div class="cardProduct-block__title">    
          <div>
            <div class="cardProduct-block__title margin-bottom24px">
              <h1 class="fs11 margin-bottom8px">Личный кабинет</h1>
              <h4 class="fs12">Моя партнёрская скидка в UnihocZoneRussia <font color="red"><srtong>{{ $priceDiscountAccordingToTheRank }}</strong></font> %</h4>
            </div>
            <div class="profile-info__line--title flex-sb fs11">
                <p id="nameprofilechangingspan">{{ $persInfo->name }}</span>&nbsp;<span id="surnameprofilechangingspan">{{ $persInfo->pers_surname }}</p>
                <p><img src="/storage/icons/edit.png" id="editnameslogoinprofile" alt="edit-logo" title="Редактировать Фамилию и/или Имя"></p>
            </div>
      
            <div id="profilechangingnamesdiv" class="profile-changing-form margin-bottom8px">
              <h6 class="color-red">Корректируем Имя / Фамилию</h6>
              <form action="" method="POST">
                  @csrf  
                  <p class="registration-form__input-item">
                      <label class="fs12" for="nameprofilechanging">Имя: </label>
                      <input id="nameprofilechanging" class="registration-form__input margin-tb4px" type="text" required  data-rule="namefieldtext" data-maxlength="30" name="editinprofilepersname" value="{{ old('name') }}" autofocus autocomplete="name">
                      <span class="registration-error">*<br>@error('name') {{ $message }} @enderror</span>
                      <span class="productAddition-form__clearance">Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.</span><br>
                      <span id="profileediterrorname" class="registration-error"></span>
                  </p>

                  <p class="registration-form__input-item">
                      <label class="fs12" for="surnameprofilechanging">Фамилия: </label>
                      <input id="surnameprofilechanging" class="registration-form__input margin-tb4px" type="text" required data-rule="namefieldtext" data-maxlength="30" name="editinprofileperssurname" value = "{{ old('surname') }}">
                      <span class="registration-error">*<br>@error('surname') {{ $message }} @enderror</span>
                      <span class="productAddition-form__clearance">Правила написания фамилии такие же, как и для имени (см.выше).</span><br>
                      <span id="profileediterrorsurname" class="registration-error"></span>
                  </p>
                  
                  <div class="d-flex flex-sa">
                      <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                      <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                  </div>
              </form>
            </div>
      
            <h4 class="fs11">Контактный номер: </h4>
            <div class="profile-info__line--title flex-sb fs12">
                <p>{{ $persInfo->pers_tel }}</p>
                <p><img src="/storage/icons/edit.png" id="edittelnumlogoinprofile" alt="edit-logo" title="Редактировать номер телефона"></p>
            </div>
            <div id="profilechangingperstelnumdiv" class="profile-changing-form margin-bottom8px">
              <form action="" method="POST">
                @csrf  
                <label class="fs12" for="inputprofilecahngingtelnum">Мой новый номер мобильного телефона: </label>
                  <input id="inputprofilecahngingtelnum" class="registration-form__input margin-tb4px" type="tel" required placeholder="+7 (999) 123-45-67" name="editperstelnum" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value="<?php if (isset ($_POST['perstelnum'])) echo $_POST['perstelnum'] ?>">
                  <span class="registration-error">*<br></span>
                  <span class="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span><br>
                  <span id="profilechangingerrortelnum" class="registration-error"></span>
                
                <div class="d-flex flex-sa">
                    <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                    <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                </div>
              </form>
            </div> 

            <h4 class="fs11">Дата рождения: </h4>
            <div class="profile-info__line--title flex-sb fs12">
              <p>{{ $persInfo->date_of_birth_view }}</p>    
              <p><img src="/storage/icons/edit.png" id="editbirthdaylogoinprofile" alt="edit-logo" title="Указать/удалить дату рождения"></p>
            </div>
            <div id="profilechangingbirthdaydiv" class="profile-changing-form margin-bottom8px">
              <form action="" method="POST">
                @csrf  
                <label class="fs12" for="inputprofilecahngingbirthday">День моего рождения: </label>
                <input class="registration-form__input margin-tb4px" type="date" id="inputbirthdayinprofilechanging" name="date_of_birth_edit_in_profile" value="{{ $persInfo->date_of_birth }}">
                  <span class="registration-error">&nbsp;<br>@error('date_of_birth') {{ $message }} @enderror</span>
                  <span class="productAddition-form__clearance">Если будет указана - мы будем поздравлять Вас с этим событием.</span><br>
                
                <input type="checkbox" id="deletebirthdayfromaccount" hidden name="deletebirthdayfromaccount" value="yes">
                  <label for="deletebirthdayfromaccount" class="fs12">Удалить дату рождения из системы</label>

                <div class="d-flex flex-sa">
                    <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                    <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                </div>
              </form>
            </div> 

            <h4 class="fs11">Адрес доставки заказов (по умолчанию): </h4>
            <div class="profile-info__line--title flex-sb fs12">
              <p>{!! $persInfo->delivery_addr_on_default_view !!}</p>    
              <p><img src="/storage/icons/edit.png" id="editdeliveryaddresslogoinprofile" alt="edit-logo" title="Изменить/удалить адрес доставки заказов по умолчанию"></p>
            </div>
            <div id="profilechangingdeliveryaddressdiv" class="profile-changing-form">
              <form action="" method="POST">
                @csrf  
                <div id="editdeliveryaddressfieldinprofile" class="registration-form__input-item margin-tb4px">
                    <label class="fs12" for="editdeliveryaddressfieldinprofilediv">Адрес доставки/получения заказов <br>(по умолчанию): </label>
                    <div contenteditable="true" id="editdeliveryaddressfieldinprofilediv" class ="registration-form__input-address margin-tb12px" data-rules="addressfieldtext">@if(!empty($persInfo->delivery_addr_on_default)){!! $persInfo->delivery_addr_on_default !!}@endif</div>
                    <span class="registration-error">@error('editdeliveryaddrinprofile') {{ $message }} @enderror</span>
                    <span class="productAddition-form__clearance">В этот адрес (если он будет здесь указан) будут отправляться заказы. Адрес можно указать при выборе транспортной компании.</span><br>
                    <span id="editinprofileerroraddr" class="registration-error"></span>
                </div>

                <input id="editdeliveryaddressfieldinprofileinput" type="hidden" name="editdeliveryaddrinprofile" value="@if(!empty($persInfo->delivery_addr_on_default)){!! $persInfo->delivery_addr_on_default !!}@endif">

                <input type="checkbox" id="deletedeliveryaddressfromaccount" hidden name="deletedeliveryaddressfromaccount" value="yes">
                  <label for="deletedeliveryaddressfromaccount" class="fs12">Удалить данные адреса из системы</label>

                <input type="checkbox" id="checkchangingaddringprofile" hidden name="checkchangingaddringprofile" value="yes">
                  <label for="checkchangingaddringprofile" class="fs12">Я не робот</label>

                <div class="d-flex flex-sa">
                    <button type="submit" class="changing-form__submit-btn" name="profile" value="change">Изменить</button>
                    <a href = "" class="changing-form__submit-btn" >Не меняем</a>
                </div>
              </form>
            </div> 
            
            <div class="profile-info__line">
              <a href="/update-password"><button type="submit" class="forgot-password__form--btn">Сменить пароль</button></a>
            </div>

            <div class="profile-info__line">
              <a href="/update-email"><button type="submit" class="forgot-password__form--btn">Изменить адрес почты</button></a>
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
    </div> */}