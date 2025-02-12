<header>
    <div class="header-top__line--welcome d-flex flex-sb flex-wrap">
        <div class="header-top__line--left">
            <span class="welcome__text">Добро пожаловать</span>&nbsp;
            <span class="welcome__invitation">в <a href="https://www.unihoc.com/teams" target="_blank">команду</a> UNIHOC</span>
        </div>
        <div class="fs12">
            &mdash;&nbsp;Участие важно,<br>
            но главное&nbsp;&mdash;&nbsp;это победа!
        </div>
    </div>
</header>    
<header class="header-secondline d-flex flex-wrap">
    <div class="header-secondline__aside--left">
        <a href="/"><img class="header-logo__img" src="/storage/icons/logo.png" alt="logo" title="Перейти на главную страницу сайта"></a>
        <nav>
            <div class="d-flex flex-wrap margin-left12px">
                <p>UnihocZoneRussia</p>
                <div class="dropdown-menu">
                    <img src="/storage/icons/expand-arrow.png" alt="external-link">
                    <div class="header-popup__menu">   
                        @foreach($categoriesMenuArr['UnihocZoneRussia'] as $category)
                            @if(isset($category[0]))
                            <div class="menu--element">
                                <a href="/products/catalog?{{ $category[0]->url_semantic}}"><h2>{{ $category[0]->category_view}}</h2></a>
                                @foreach($category as $key=>$value)                                 
                                    @if(isset($value->prop_url_semantic) && ($key != 0)) 
                                    <a href="/products/catalog?{{ $category[0]->url_semantic}}={{ $value->prop_title }}&{{ $value->prop_title }}={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a>
                                    @elseif(!empty($value->model) && $key != 0)
                                    <a href="/products/catalog?{{ $value->url_semantic }}=model&model={{ $value->model }}">{{ $value->model }}</a> 
                                    @elseif(!empty($value->url_semantic) && $key != 0)
                                    <a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $value->url_semantic }}">{{ $value->category_view_2 }}</a> 
                                    @php //var_dump($category[0]); @endphp
                                    @elseif($key != 0)
                                    {{-- <a href="/products/catalog?">{{ $category[$key][0]->category_view_2}}</a> --}}
                                    <p><strong>{{ $category[$key][0]->category_view_2}}</strong></p>
                                        <ul class="prodsubcat-list__pop-up">
                                        @foreach($category[$key] as $subCatKey=>$subCatValue)
                                            @if(isset($subCatValue->url_semantic) && ($subCatKey != 0))
                                            <li><a href="/products/catalog?{{ $subCatValue->url_semantic }}">{{ $subCatValue->category_view_2 }} </a></li>
                                            @endif
                                        @endforeach
                                        </ul> 
                                    @endif
                                @endforeach
                            </div>
                            @endif
                        @endforeach
                    </div>
                </div>

                <p>UNIHOC</p>
                    <div class="dropdown-menu">
                        <img src="/storage/icons/expand-arrow.png" alt="external-link">
                        <div class="header-popup__menu">                    
                        @foreach($categoriesMenuArr['unihoc'] as $category)
                            @if(isset($category[0]))
                            <div class="menu--element">
                                <a href="/products/{{ $category[0]->url_semantic}}?brand%5B%5D=unihoc"><h2>{{ $category[0]->category_view}}</h2></a>
                                @foreach($category as $key=>$value)                                 
                                    @if(isset($value->prop_url_semantic) && ($key != 0)) 
                                    <a href="/products/catalog?{{ $category[0]->url_semantic}}={{ $value->prop_title }}&{{ $value->prop_title }}={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a>
                                    @elseif(!empty($value->model) && $key != 0)
                                    <a href="/products/catalog?{{ $value->url_semantic }}=model&model={{ $value->model }}">{{ $value->model }}</a> 
                                    @elseif(!empty($value->url_semantic) && $key != 0)
                                    <a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $value->url_semantic }}">{{ $value->category_view_2 }}</a> 
                                    @php //var_dump($category[0]); @endphp
                                    @elseif($key != 0)
                                    <p>{{ $category[$key][0]->category_view_2}}</p>
                                        <ul class="prodsubcat-list__pop-up">
                                        @foreach($category[$key] as $subCatKey=>$subCatValue)
                                            @if(isset($subCatValue->url_semantic) && ($subCatKey != 0)) 
                                            <li><a href="/products/catalog/">{{ $subCatValue->category_view_2 }} </a></li>
                                            @endif
                                        @endforeach
                                        </ul> 
                                    @endif
                                @endforeach
                            </div>
                            @endif
                        @endforeach
                        </div>
                    </div>
                <p>ZONE</p>
                    <div class="dropdown-menu">
                        <img src="/storage/icons/expand-arrow.png" alt="external-link">
                        <div class="header-popup__menu">   
                        @foreach($categoriesMenuArr['zone'] as $category)
                            @if(isset($category[0]))
                            <div class="menu--element">
                                <a href="/products/{{ $category[0]->url_semantic}}?brand%5B%5D=zone"><h2>{{ $category[0]->category_view}}</h2></a>
                                @foreach($category as $key=>$value)                                 
                                    @if(isset($value->prop_url_semantic) && ($key != 0)) 
                                    <a href="/products/catalog?{{ $category[0]->url_semantic}}={{ $value->prop_title }}&{{ $value->prop_title }}={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a>
                                    @elseif(!empty($value->model) && $key != 0)
                                    <a href="/products/catalog?{{ $value->url_semantic }}=model&model={{ $value->model }}">{{ $value->model }}</a> 
                                    @elseif(!empty($value->url_semantic) && $key != 0)
                                    <a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $value->url_semantic }}">{{ $value->category_view_2 }}</a> 
                                    @php //var_dump($category[0]); @endphp
                                    @elseif($key != 0)
                                    <p>{{ $category[$key][0]->category_view_2}}</p>
                                        <ul class="prodsubcat-list__pop-up">
                                        @foreach($category[$key] as $subCatKey=>$subCatValue)
                                            @if(isset($subCatValue->url_semantic) && ($subCatKey != 0)) 
                                            <li><a href="/products/catalog/">{{ $subCatValue->category_view_2 }} </a></li>
                                            @endif
                                        @endforeach
                                        </ul> 
                                    @endif
                                @endforeach
                            </div>
                            @endif
                        @endforeach
                        </div>
                    </div>
            </div>    
        </nav>
    </div>

    <div class="header-secondline__aside--right">
        <div id='headerauthblockdiv' class="header-auth__dropdown">
          <img src="/storage/icons/expand-arrow.png" alt="external-link">
          
          <div class="header-auth__block--menu">
            <div class="header-auth__dropdown--block">
              <p><?= $authBlockContentFinal ?></p>
            </div>
          </div>
        </div>
        <span class="header-auth__user--status">
            {{ $userName }}
        </span>

        <div class="header-icon__block">
        @if(empty($user_id))
            <div class="header-orders__counter header-logo__counter color-blue"></div>
            {{-- это не работает: <div id="app" data-page="{{ json_encode($page) }}"></div> <!-- Контейнер для Inertia.js --> --}}
            {{-- @inertia('Header') <!-- Рендерим хедер через Inertia --> --}}
            
        @else
            @if($userAuthedOrdersCount != 0)
            <div class="header-logo__counter color-blue">{{ $userAuthedOrdersCount }}</div>
            @endif
        @endif
        @if(empty($user_id))
            <a class="" href="/orders"><img src="/storage/icons/orders-in-blue.png" alt="orders-icon" title="Покупки / Заказы"></a>
            <p><a class="header-icon" href="/orders">Заказы</a></p>
        @else
            <a class="" href="/profile?getorders=all"><img src="/storage/icons/orders-in-blue.png" alt="orders-icon" title="Покупки / Заказы"></a>
            <p><a class="header-icon" href="/profile?getorders=all">Заказы</a></p>
        @endif
        </div>     

        <div class="header-icon__block">
          <div class="header-favorites__counter header-logo__counter color-red">0</div>
          <a class="" href="/products/favorites"><img src="/storage/icons/favorite.png" alt="favorite" title="Посмотреть избранное"></a>
          <p><a class="header-icon" href="/products/favorites">Избранное</a></p>
        </div>

        <div class="header-icon__block basket-logo__div">
          <div class="header-basket__counter header-logo__counter color-red">0</div>
          <a class="" href="/products/basket"><img src="/storage/icons/icon-shopping-cart.png" alt="basket" title="Посмотреть корзину"></a>
          <p><a class="header-icon" href="/products/basket">Корзина</a></p>
        </div>
    </div>
    {{-- Когда пользователь переадресован, то мы выводим сообщение из сессии: --}}
    <div id="flashmessage" class="flash-message">@if (session('flash')){!! session('flash') !!}@endif</div>

    {{-- Когда пользователь регистрируется, то мы должны вывести ему сообщение, что на заявленную почту ему выслана ссылка для подтверждения адреса --}}
    @if (session()->has('newUserRegisteredAndNeedToKnowConfirmEmail'))
    <div id="divNeedToConfirmEmail" class="flash-message">
        <img id="imgNeedToConfirmEmail" class="close-img" src="/storage/icons/icon-close.png" alt="close" title="Супер! Понятно. Закрыть">
        <div class="notification-text">
            <h2>Рады вас видеть!</h2>
            <p>По указанному в процессе регистрации электронному адресу отправлена ссылка.</p>
            <p>Чтобы пользоваться всеми преимуществами, предоставляемыми зарегистрированным и авторизованным пользователям, просим вас подтвердить электроннную почту - "кликнуть" по этой ссылке.</p>
            <p>Если вы не видите письмо, на всякий случай, проверьте папку "Спам".</p>
            <p>Ссылка подтверждения адреса действительна (активна) в течение одного часа.</p>
            <h2>Добро пожаловать!</h2>
        </div>
    </div>
    @endif

    {{-- Скопируем эту форму из oredrslayoutblade для того, чтобы проверять строку id- заказаов из локального хранилища браузера и сравнивать её с тем, что есть реально в БД... и корректировать строку хранилища, если есть диссонанс --}}
    <form id="checkordersinlocalstorageforminheader" action="{{ url()->current() }}" method="POST">
        @csrf
        <input id="inputForCheckingOrdersFromLacalStorageinheader" type="hidden" name="orderslistfromlocalstorageinheader">
    </form>

    {{-- Для передачи в jS id-заказов из локального хранилища НЛО, которые есть и в БД, после сверки данных --}}
    <input id="idsOrdersInUserLocalStorage" type="hidden" class="d-none" data-idsordersinuserlocalstoragetodel="{{ $idsOrdersInUserLocalStorageToDel }}" value="{{ $idsOrdersInUserLocalStorage}}">
    <script src="{{ asset('js/orderschecklocalstorageinheader.js') }}"></script>


    <script src="{{ asset('js/headers-counters.js') }}"></script>
    <script src="{{ asset('js/email-need-to-confirm-notification.js') }}"></script>

</header>
