<!DOCTYPE html>
<html lang="ru">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" 		content="width=device-width, initial-scale=1.0">
		<meta name="description" 	content="{{ $description }}">
		<meta name="keywords"  		content="{{ $keywords    }}">
		<meta name="robots"    		content="{{ $robots      }}">
		<meta name="csrf-token" 	content="{{ csrf_token() }}">
		<link type="image/png" sizes="16x16" 	rel="icon" href="{{ asset('favicons/favicon-16x16.png')   }}">
		<link type="image/png" sizes="32x32" 	rel="icon" href="{{ asset('favicons/favicon-32x32.png')   }}">
		<link type="image/png" sizes="96x96" 	rel="icon" href="{{ asset('favicons/favicon-96x96.png')   }}">
		<link type="image/png" sizes="120x120" 	rel="icon" href="{{ asset('favicons/favicon-120x120.png') }}">
		<link type="image/png" sizes="256x256" 	rel="icon" href="{{ asset('favicons/favicon-256x256.png') }}">
		<script src="{{ asset('js/scripts.js') }}"></script>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="{{ asset('css/reset.css') }}">
		<link rel="stylesheet" href="{{ asset('css/styles.css') }}">
		<title>{{ $title }}</title>
		@viteReactRefresh
		@vite(['resources/js/app.jsx']) <!-- Подключение React через Vite -->
	</head>
	<body>
		<div class="wrapper">
            <x-header /> 
			
			{{-- Если мы используем Inertia для рендеринга всей страницы, то переменная $page должна быть передана автоматически. 
				Однако, когда мы хотим использовать Inertia только для части страницы (в нашем примере - для компонента в хедере), то мы "руками" должны 
				передать эту переменную. 
				
				Оказалось, что это не работает: ошибка Undefined variable $page <x-header :page="$page" /> <!-- Передаем переменную $page в компонент header - это для рендеринга  --> 
			--}} 
				
			{{ $slot }}
            <x-footer />
		</div>
	</body>
</html>