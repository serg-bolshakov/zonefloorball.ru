/*
    import { defineConfig } from 'vite';
    import laravel from 'laravel-vite-plugin';
    import react from '@vitejs/plugin-react';   // Настраиваем Vite для сборки фронтэнда 31.01.2025. Добавляем настройки для React...

    export default defineConfig({
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),                            // Настраиваем Vite для сборки фронтэнда 31.01.2025. Добавляем настройки для React...
        ],
        build: {
            rollupOptions: {
                external: ['@inertiajs/react'], // Добавил это от безысходности... что-то шло не так... искал варианты...
            },
        },
        server: {
            host: 'localhost',
            port: 5173,
            hmr: {
                host: 'localhost',
            },
        },
    });
*/

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';           // Настраиваем Vite для сборки фронтэнда 31.01.2025. Добавляем настройки для React...

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),                                    // Настраиваем Vite для сборки фронтэнда 31.01.2025. Добавляем настройки для React...
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // Добавляем поддержку .ts и .tsx 10/02/2025 - начинаем использовать TypeScript (добавил строки 41-43)...
    },
    build: {
        rollupOptions: {
            external: ['@inertiajs/react'],         // Добавил это от безысходности... что-то шло не так... искал варианты...
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});