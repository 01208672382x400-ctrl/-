# Voice Rooms — Production Build

هذا المشروع يحول قالب غرف الدردشة الصوتية إلى تطبيق قابل للتطوير مع Next.js + Supabase/PostgreSQL + LiveKit + Capacitor Android.

## ما تم ربطه فعليًا
- Supabase Auth + profiles.
- PostgreSQL: users, rooms, seats, messages, wallet transactions, gifts, follows, blocks, notifications, recharge orders, VIP subscriptions.
- LiveKit/WebRTC للصوت الحقيقي.
- Server-side LiveKit token generation.
- Atomic gift transfer داخل PostgreSQL.
- طلبات الشحن وVIP محفوظة بحالة pending حتى تأكيد الدفع.
- لوحة الإدارة محمية بـ ADMIN_USER_IDS.
- إعداد Android/Capacitor + GitHub Actions لبناء APK.

## قاعدة البيانات
نفّذ كامل ملف supabase-schema.sql داخل Supabase SQL Editor.

## متغيرات البيئة
انسخ .env.example إلى .env.local.
لا تضع SUPABASE_SERVICE_ROLE_KEY أو LIVEKIT_API_SECRET داخل تطبيق Android.

## Android APK
أضف Secrets الخاصة بـ Supabase وLiveKit وADMIN_USER_IDS في GitHub ثم شغّل GitHub Actions → Android APK.
