   
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" 		content="width=device-width, initial-scale=1.0">
    <meta name="description" 	content="{{ $title }}">
    <meta name="keywords"  		content="{{ $title }}">
    <meta name="robots"    		content="INDEX,FOLLOW">
    <meta name="csrf-token" 	content="{{ csrf_token() }}">
    <link type="image/png" sizes="16x16" 	rel="icon" href="{{ asset('favicons/favicon-16x16.png')   }}">
    <link type="image/png" sizes="32x32" 	rel="icon" href="{{ asset('favicons/favicon-32x32.png')   }}">
    <link type="image/png" sizes="96x96" 	rel="icon" href="{{ asset('favicons/favicon-96x96.png')  }}">
    <link type="image/png" sizes="120x120" 	rel="icon" href="{{ asset('favicons/favicon-120x120.png') }}">
    <link type="image/png" sizes="256x256" 	rel="icon" href="{{ asset('favicons/favicon-256x256.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <title>{{ $title }} | {{ config('app.name') }}</title>
<head>
<body>    
    {{-- <article>
        <h1>{{ $title }} v{{ $version }} интернет-магазина ZoneFloorball.RU</h1>
        <p class="last-update">Дата вступления в силу: {{ $effective_date->format('d.m.Y') }}</p>
        <iframe src="/storage/{{ $file_path }}" width="100%" height="800px"></iframe>
    </article> --}}

    <article>
        <h1>{{ $title }} интернет-магазина ZoneFloorball.RU</h1>
        <p class="last-update">Дата вступления в силу: {{ $effective_date->format('d.m.Y') }} (v{{ $version }})</p>

        {{-- Для десктопов --}}
        <div class="desktop-view">
            <iframe 
                src="{{ asset('storage/' . $file_path) }}" 
                width="100%" 
                height="800px"
            ></iframe>
        </div>

        {{-- Для мобильных --}}
        <div class="mobile-view">
            <a 
                href="{{ asset('storage/' . $file_path) }}" 
                class="download-pdf"
                download
            >
                Скачать {{ $title }} (PDF)
            </a>
        </div>
    </article>
</body>