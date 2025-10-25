<?php
    // app/Http/Controllers/IndexReactController.php
    namespace App\Http\Controllers;
    use Inertia\Inertia;

    use Illuminate\Support\Facades\Auth;
    use App\Models\User;

    class IndexReactController extends Controller {
        public function index() {
            
            return Inertia::render('Home', [
                'title' => 'Флорбольная экипировка | ZoneFloorball - магазин всего для флорбола',
                'robots' => 'INDEX,FOLLOW',
                'description' => '✨ Купить флорбольную экипировку для детей и взрослых. Клюшки, мячи, ворота, аксессуары от ведущих брендов Алетерс, Unihoc, Zonefloorball. Доставка по России.',
                'keywords' => 'Клюшки для флорбола, обувь, очки, сумки и чехлы для взрослых и детей. Флорбольные ворота и мячи.',
            ]);
        }
    }