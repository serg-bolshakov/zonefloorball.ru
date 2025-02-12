<?php

namespace App\View\Components\AsideWithFilters;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\FilterTrait;

class Eyewears extends Component
{   

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
        $asideWithFilters = $this->getAsideWithFilters($categoryId = 7, $prodStatus = 1); 
                
        return view('components.aside-with-filters.eyewears', [
            'asideWithFilters' => $asideWithFilters,
        ]);

    }
}