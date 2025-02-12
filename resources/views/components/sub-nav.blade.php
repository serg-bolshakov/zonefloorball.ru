@if(!empty($subNavBar))
@php //var_dump($subNavBar); var_dump('sub-nav.blade.php'); @endphp
    <div class="subnav d-flex">
        <div class="subnav-elem d-flex">Каталог</div>

        <div class="subnav-arrow">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="subnav-elem d-flex">{{ $subNavBar['categoryValueView'] }}</div>
        @if(isset($subNavBar['propClass']) && !empty($subNavBar['propClass']) && isset($subNavBar['propValueView']) && !empty($subNavBar['propValueView']))
        <div class="subnav-arrow">
            <span></span>
            <span></span>
            <span></span>
        </div>
        @endif
        <div class="subnav-elem d-flex">
            @if(isset($subNavBar['propClass']) && !empty($subNavBar['propClass']) && isset($subNavBar['propValueView']) && !empty($subNavBar['propValueView'])) {{ $subNavBar['propClass'] }}&nbsp;{{ $subNavBar['propValueView'] }}
            @elseif(isset($subNavBar['propValueView']) && !empty($subNavBar['propValueView'])){{ $subNavBar['propValueView'] }}
            @endif
        </div>
    </div>
    @endif 


{{-- это оригинальный вариант, который работал до всех манипуляций 08.01.2025 ...
@if(!empty($subNavBar))
<div class="subnav d-flex">
    <div class="subnav-elem d-flex">Каталог</div>

    <div class="subnav-arrow">
        <span></span>
        <span></span>
        <span></span>
    </div>
    <div class="subnav-elem d-flex">{{ $subNavBar['categoryValueView'] }}</div>
    <div class="subnav-arrow">
        <span></span>
        <span></span>
        <span></span>
    </div>
    <div class="subnav-elem d-flex">{{ $subNavBar['propClass'] }}&nbsp;{{ $subNavBar['propValueView'] }}</div>
</div>
@endif
--}}


{{-- это вариант после всех манипуляций, которые я сделал в попытках поиска проблемы с разными браузерами, когда всё должно было работать 08.01.2025
    @php var_dump($subNavBar); var_dump('sub-nav.blade.php'); @endphp
    @if(!empty($subNavBar))
    <div class="subnav d-flex">
        <div class="subnav-elem d-flex">Каталог</div>

        <div class="subnav-arrow">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="subnav-elem d-flex">{{ $subNavBar['categoryValueView'] }}</div>
        <div class="subnav-arrow">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="subnav-elem d-flex">
            @if(isset($subNavBar['propClass']) && !empty($subNavBar['propClass']) && isset($subNavBar['propValueView']) && !empty($subNavBar['propValueView'])) {{ $subNavBar['propClass'] }}&nbsp;{{ $subNavBar['propValueView'] }}
            @elseif(isset($subNavBar['propValueView']) && !empty($subNavBar['propValueView'])){{ $subNavBar['propValueView'] }}
            @endif
        </div>
    </div>
    @endif 
--}}