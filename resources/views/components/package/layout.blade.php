<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<x-nav-bar />

    <main>
        <x-dynamic-component :component="$targetComponent" />
        <x-recently-viewed-products />
	</main>	
    
</x-maket-main>

