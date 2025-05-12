<?php
    namespace App\Http\Controllers;
    use Inertia\Inertia;

    use Illuminate\Support\Facades\Auth;
    use App\Models\User;

    class IndexReactController extends Controller {
        public function index() {
            
            return Inertia::render('Home', [
                'title' => 'UnihocZoneRussia Флорбольная экипировка.Всё для флорбола. Купить',
                'robots' => 'INDEX,FOLLOW',
                'description' => 'Найти, выбрать и купить товары для флорбола для детей и взрослых. Всё для флорбола от ведущего мирового производителя.',
                'keywords' => 'Клюшки для флорбола, обувь, очки, сумки и чехлы для взрослых и детей. Флорбольные ворота и мячи.',
            ]);
        }
    }