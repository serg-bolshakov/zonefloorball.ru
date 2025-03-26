<?php
// app/Http/Controllers/BallsAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class BallsAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithBallsFilters = $this->getAsideWithFilters($categoryId = 3, $prodStatus = 1);
                return response()->json([
                    'asideWithBallsFilters' => $asideWithBallsFilters,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }