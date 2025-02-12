        <div class="nav-bar">
                <ul class="breadcrumb">
            @foreach($categoriesMenuArrAllBrands as $category)
        {!! $category !!}
            @endforeach
    </ul>
            </div>

            <script src="{{ asset('js/deleteLastCornerInNavBar.js') }}"></script>

