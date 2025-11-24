# Legacy Components Cleanup
Start date: 2025-11-01

## Components to remove:
## OrderHelperTrait usages:

### ✅ УДАЛЕНО:
[x] 2025-11-01 | `app/Mail/NewOrderForCustomer.php:use App\Traits\OrderHelperTrait;`
[x] 2025-11-01 | `app/Mail/NewOrderForCustomer.php:use OrderHelperTrait;`

### 🔍 НАЙДЕНО (еще есть другие использования):
[ ] - `app/View/Components/Package/Basket.php:use App\Traits\OrderHelperTrait;`
[ ] - `app/View/Components/Package/Basket.php:    use OrderHelperTrait;`
[ ] - `app/View/Components/Package/Orders.php:use App\Traits\OrderHelperTrait;`
[ ] - `app/View/Components/Package/Orders.php:    use OrderHelperTrait;`

## Package/Orders usages:
[ ] - `app/Http/Controllers/PackageController.php:class PackageController extends Controller`
[ ] - `app/View/Components/Package/Basket.php:namespace App\View\Components\Package;`
[ ] - `app/View/Components/Package/Basket1.php:namespace App\View\Components\Package;`
[ ] - `app/View/Components/Package/Favorites.php:namespace App\View\Components\Package;`
[ ] - `app/View/Components/Package/Orders.php:namespace App\View\Components\Package;`
