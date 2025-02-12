<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<x-nav-bar />
	
	<div class="container-main d-flex flex-sb flex-wrap">
		<main>
			{{ $slot }}	
		</main>
		<aside class="aside-right">
			<x-video />
		</aside>
	</div>

</x-maket-main>