<?php
// app/Http/Controllers/SticksAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class SticksAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithSticksFilters = $this->getAsideWithFilters($categoryId = 1, $prodStatus = 1);
                // dd($asideWithSticksFilters);
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