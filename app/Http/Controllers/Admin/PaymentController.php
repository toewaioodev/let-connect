<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        
        $query = PaymentRequest::with('mobileUser')->orderBy('created_at', 'desc');
        
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return Inertia::render('admin/payments/index', [
            'payments' => $query->get(),
            'filters' => $request->only('status'),
        ]);
    }

    public function approve(Request $request, PaymentRequest $paymentRequest): RedirectResponse
    {
        $paymentRequest->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_note' => $request->input('admin_note'),
        ]);

        $user = $paymentRequest->mobileUser;
        if ($user) {
            $durationDays = 30; // Default
            if (Str::contains($paymentRequest->plan_id, 'monthly')) $durationDays = 30;
            elseif (Str::contains($paymentRequest->plan_id, '3months')) $durationDays = 90;
            elseif (Str::contains($paymentRequest->plan_id, '5months')) $durationDays = 150;
            elseif (Str::contains($paymentRequest->plan_id, 'yearly')) $durationDays = 365;

            $currentExpiresAt = $user->premium_expires_at && now()->isBefore($user->premium_expires_at)
                ? Carbon::parse($user->premium_expires_at)
                : now();

            $user->update([
                'is_premium' => true,
                'premium_expires_at' => $currentExpiresAt->addDays($durationDays),
            ]);
        }

        return redirect()->back()->with('success', 'Payment approved and premium status updated.');
    }

    public function reject(Request $request, PaymentRequest $paymentRequest): RedirectResponse
    {
        $paymentRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_note' => $request->input('admin_note'),
        ]);

        return redirect()->back()->with('success', 'Payment request rejected.');
    }
}
