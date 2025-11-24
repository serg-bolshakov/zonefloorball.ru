<!-- resources/views/test-media-upload.blade.php -->
<form action="/test-media-upload" method="POST" enctype="multipart/form-data">
    @csrf
    <input type="hidden" name="review_id" value="{{ $review->id }}">
    
    <div>
        <label>Выберите файлы для отзыва #{{ $review->id }}:</label>
        <input type="file" name="media[]" multiple accept="image/*,video/*">
    </div>
    
    <button type="submit">Загрузить</button>
</form>