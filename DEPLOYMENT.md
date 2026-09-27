# Deployment Checklist

## الخدمات
1. Supabase project.
2. LiveKit Cloud أو خادم LiveKit.
3. استضافة HTTPS.
4. مزود دفع عند تفعيل الشحن/VIP.

## قاعدة البيانات
نفّذ كامل ملف supabase-schema.sql داخل Supabase SQL Editor.

## الأمان
لا تضع SUPABASE_SERVICE_ROLE_KEY أو LIVEKIT_API_SECRET داخل تطبيق Android.
طلبات الشحن تبدأ pending ولا تمنح العملات قبل تأكيد الدفع من webhook.
