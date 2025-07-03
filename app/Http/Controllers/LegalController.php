<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LegalController extends Controller
{
    public function show($type) {
        $document = LegalDocument::where('type', str_replace('-', '_', $type))
            ->where('is_active', true)
            ->latest('effective_date')
            ->firstOrFail();

        $effectiveDate = Carbon::parse($document->effective_date);
        $title = $type === 'privacy-policy' ? 'Политика конфиденциальности' : 'Публичная оферта';
          
        return view('legal.show', [
            'title'             => $title,
            'file_path'         => $document->file_path,
            'version'           => $document->version,
            'effective_date'    => $effectiveDate,
        ]);
    }

    /*  Это пока комментируем: надо подумать, как проводить подтверждение, если сменятся условия оферты или правил обработки персональных данных...
        public function showReconfirmForm() {
            return view('legal.reconfirm', [
                'privacyPolicy' => LegalDocument::getCurrentVersion('privacy_policy'),
                'offer'         => LegalDocument::getCurrentVersion('offer')
            ]);
        }

        public function processReconfirm(Request $request) {
            $user = auth()->user();
            
            $user->update([
                'privacy_policy_agreed_at' => now(),
                'offer_agreed_at' => now(),
                'privacy_policy_version' => $request->input('privacy_version'),
                'offer_version' => $request->input('offer_version'),
            ]);

            // 
            return redirect()->route('order.create'); // Возвращаем к оформлению заказа
        }
    */
}
