




/** Оптимизированная структура (рекомендуемая)
  resources/
    js/
      Types/
        inertia.d.ts       # Типы Inertia.js
        delivery/          # Типы доставки
          widget.d.ts      # Типы виджета Почты России
          api.d.ts         # Типы API-ответов
        index.d.ts         # Главный файл экспорта типов
 

  Разделение ответственности:
    - inertia.d.ts — только для типов, связанных с Inertia.js
    - delivery/*.d.ts — для бизнес-логики доставки
 */