<?php
// app/Http/Middleware/AdminMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware {
    public function handle($request, Closure $next) {
        if (auth()->user()->user_access_id !== 2) {
            abort(403);
        }
        return $next($request);
    }
}