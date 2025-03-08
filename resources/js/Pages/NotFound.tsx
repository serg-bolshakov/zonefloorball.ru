// resources/js/Pages/NotFound.tsx
import { Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <div>
            <h1>404 - Страница не найдена</h1>
            <p>Извините, запрашиваемой страницы не существует...</p>
            <Link href="/">Вернуться на главную</Link>
        </div>
    );
}