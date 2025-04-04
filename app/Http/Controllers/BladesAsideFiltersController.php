<?php
// app/Http/Controllers/BladesAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class BladesAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithBladesFilters = $this->getAsideWithFilters($categoryId = 2, $prodStatus = 1);
                return response()->json([
                    'asideWithBladesFilters' => $asideWithBladesFilters,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }