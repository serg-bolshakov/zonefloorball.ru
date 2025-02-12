<?php

namespace App\View\Components;
use App\Traits\CategoryTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Footer extends Component
{
    use CategoryTrait;
    
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
        $categoriesMenuArr = $this->getMenuCategories();
        return view('components.footer', [
            'categoriesMenuArr' => $categoriesMenuArr
        ]);
    }
}
