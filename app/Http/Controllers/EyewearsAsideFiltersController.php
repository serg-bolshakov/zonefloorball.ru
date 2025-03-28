<?php
// app/Http/Controllers/EyewearsAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class EyewearsAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithFilters = $this->getAsideWithFilters($categoryId = 7, $prodStatus = 1);
                return response()->json([
                    'asideWithFilters' => $asideWithFilters,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }