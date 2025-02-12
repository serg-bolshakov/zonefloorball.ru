<x-maket-main>

    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<x-nav-bar />

    <main>
        <x-package.orders />
        <x-recently-viewed-products />
    </main>	  

</x-maket-main>
{{-- Скопируем эту форму в header для того, чтобы проверять строку id- заказаов из локального хранилища браузера и сравнивать её с тем, что есть реально в БД... и корректировать строку хранилища, если есть диссонанс --}}
<form id="checkordersinlocalstorageform" action="{{ url()->current() }}" method="POST">
    @csrf
    <input id="inputForCheckingOrdersFromLacalStorage" type="hidden" name="orderslistfromlocalstorage">
</form>
<script src="{{ asset('js/orderschecklocalstorage.js') }}"></script>