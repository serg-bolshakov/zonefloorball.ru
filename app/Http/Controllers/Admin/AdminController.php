<?php
// app/Http/Controllers/Admin/AdminController.php

    namespace App\Http\Controllers\Admin;
    
    use App\Http\Controllers\Controller;
    use Inertia\Inertia;
    use App\Models\Product;
    use App\Models\Order;

    class AdminController extends Controller {
        public function dashboard() {
            return Inertia::render('Admin', [
                'title' => 'Админка',
                'robots' => 'NOINDEX,NOFOLLOW',
                'description' => '',
                'keywords' => '',    
            ]);
        }
    }