<?php
// app/Http/Controllers/BladesAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class BladesAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithSticksFilters = $this->getAsideWithFilters($categoryId = 2, $prodStatus = 1);
                return response()->json([
                    'asideWithSticksFilters' => $asideWithSticksFilters,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }