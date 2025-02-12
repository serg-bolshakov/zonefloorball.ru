<?php

namespace App\View\Components\AsideWithFilters;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\CategoryTrait;
use App\Traits\FilterTrait;

class Sticks extends Component
{   
    use CategoryTrait;
    use FilterTrait;

    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $asideWithFilters = $this->getAsideWithFilters($categoryId = 1, $prodStatus = 1); 
                
        return view('components.aside-with-filters.sticks', [
            'asideWithFilters' => $asideWithFilters,
        ]);

    }
}
