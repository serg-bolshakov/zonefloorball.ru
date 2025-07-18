<?php
// app/Services/ErrorNotifierService.php - служба для обработки ошибок:
namespace App\Services;

use Illuminate\Support\Facades\Mail;
use App\Mail\ErrorNotification;
use App\Mail\PaymentFailedNotification;
use App\Models\User;

class ErrorNotifierService
{
    public static function notifyAdmin(\Throwable $exception, array $context = [])
    {
        try {
            /*
                $admins = User::where('is_admin', true)->pluck('email');
                
                if ($admins->isNotEmpty()) {
                    Mail::to($admins)->send(
                        new ErrorNotification($exception, $context)
                    );
                } 
            */
                    // шлём ошибку мне в любом случае...
            Mail::to('serg.bolshakov@gmail.com')->send(
                new ErrorNotification($exception, $context)
            );
            
            \Log::error($exception->getMessage(), array_merge(
                ['exception' => $exception],
                $context
            ));
            
        } catch (\Throwable $e) {
            \Log::critical('Failed to send error notification', [
                'original_error' => $exception->getMessage(),
                'notification_error' => $e->getMessage()
            ]);
        }
    }

    public static function notifyPaymentFailure($order, $errorDetails)
    {
        try {
            /* 
                $admins = User::where('is_admin', true)->pluck('email');
                
                if ($admins->isNotEmpty()) {
                    Mail::to($admins)->send(
                        new PaymentFailedNotification($order, $errorDetails)
                    );
                } */
            
            Mail::to('serg.bolshakov@gmail.com')->send(
                new ErrorNotification($exception, $context)
            );

            \Log::error('Payment failed', [
                'order_id' => $order->id,
                'details' => $errorDetails
            ]);
            
        } catch (\Throwable $e) {
            \Log::critical('Failed to send payment failure notification', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}