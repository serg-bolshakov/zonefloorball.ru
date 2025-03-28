<?php
// app/Http/Controllers/GripsAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class GripsAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            
            try {
                $asideWithFilters = $this->getAsideWithFilters($categoryId = 6, $prodStatus = 1);
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