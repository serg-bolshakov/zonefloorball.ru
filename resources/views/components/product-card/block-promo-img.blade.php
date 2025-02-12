@if($data)
    @foreach($data['img_link'] as $link)
    <a href="/storage/{{ $link['img_link'] }}">
        <img src="/storage/{{ $link['img_link'] }}" alt="{{ $data['category'] }}  {{ $data['product']->model }} {{ $data['product']->marka }}" title ="Кликни на изображение, чтобы посмотреть его на всём экране.">
    </a>
    @endforeach
@endif