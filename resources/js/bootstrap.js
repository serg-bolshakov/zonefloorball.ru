// resources/js/bootstrap.js

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';
window.axios.defaults.withCredentials = true; // Важно! Включаем передачу кук
// window.axios.defaults.baseURL = 'http://localhost:8000'; // Базовый URL Laravel

// Автоматическое подхватывание CSRF-токена (больше не нужно вручную получать _token)
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Глобальный интерсептор для обработки 419 ошибок (устаревшая сессия)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 419) {
      console.log('Сессия устарела, автоматически обновляем страницу...');
      window.location.reload();
      return Promise.reject(error); // Прерываем цепочку, но не вызываем новые ошибки
    }
    return Promise.reject(error);
  }
);

/*// Слушаем принудительное обновление при logout
const checkForceRefresh = () => {
    const cookies = document.cookie.split(';');
    const forceRefreshCookie = cookies.find(cookie => 
        cookie.trim().startsWith('force_client_refresh=')
    );
    
    if (forceRefreshCookie) {
        console.log('Обнаружен logout в другой вкладке, обновляем страницу...');
        // Удаляем куку и обновляемся
        document.cookie = 'force_client_refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.reload();
    }
};

// Проверяем при загрузке страницы
checkForceRefresh();

// И периодически проверяем (на всякий случай)
setInterval(checkForceRefresh, 5000);

// Проверка при фокусе на вкладку
const handleVisibilityChange = () => {
    if (!document.hidden) {
        // Вкладка стала активной - проверяем актуальность сессии
        console.log('Вкладка активирована, проверяем сессию...');
        checkForceRefresh();
    }
};

// Слушаем изменения видимости
document.addEventListener('visibilitychange', handleVisibilityChange);

// Также при фокусе окна (дополнительная защита)
window.addEventListener('focus', checkForceRefresh); */

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';

// import Pusher from 'pusher-js';
// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
//     wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });
