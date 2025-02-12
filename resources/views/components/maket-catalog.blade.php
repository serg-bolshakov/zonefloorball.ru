<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<main>
		<section class="catalog-page__title">
			<img src="/storage/images/main/{{ $catalogCategoryTitleImg }}.jpg" alt="catalog-{{ $catalogCategoryTitleImg }}">
			<div class="title--position title--text">
				<h1>{{ $catalogCategoryName }}</h1>
			</div>
		</section>
		<x-nav-bar />
		
		<x-catalog.sub-nav />

		{{ $slot }}
		
	</main>	
			
	<script src="{{ asset('js/accordionCatalogAsideBar.js') }}"></script>
</x-maket-main>