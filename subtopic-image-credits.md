# مصادر الصور المصغرة داخل الفصول

تستخدم صور المصغرات المحلية نسخًا مضغوطة من صور ظهرت في صفحات البحث العامة على Unsplash. تم حفظ النسخ داخل `images/subtopic-thumbs/` حتى لا يعتمد الفصل على طلبات خارجية أثناء التصفح.

| الملف | الموضوعات | صفحة المصدر |
|---|---|---|
| `strategy.webp` | الاستراتيجية، السوق، التحليل العام | https://unsplash.com/s/photos/marketing-strategy |
| `planning.webp` | التخطيط، المنافسون، السبورة | https://unsplash.com/s/photos/marketing-strategy |
| `team.webp` | العميل، الجمهور، العمل الجماعي | https://unsplash.com/s/photos/marketing-strategy |
| `idea.webp` | الأفكار، الدوافع، الإبداع | https://unsplash.com/s/photos/marketing-strategy |
| `writing.webp` | كتابة المحتوى، الأفكار، الرسائل | https://unsplash.com/s/photos/marketing-strategy |
| `analytics.webp` | القياس، البيانات، النتائج | https://unsplash.com/s/photos/marketing-strategy |
| `email.webp` | البريد والتواصل الرقمي | https://unsplash.com/s/photos/email-marketing |
| `mobile.webp` | التسويق الرقمي، الهاتف، الإنترنت | https://unsplash.com/s/photos/marketing-strategy |
| `laptop.webp` | المنتج، السعر، التوزيع، الأدوات | https://unsplash.com/s/photos/marketing-strategy |
| `brand.webp` | الهوية والعلامة التجارية | https://unsplash.com/s/photos/branding-strategy |
| `persona.webp` | شخصية العميل ورحلة العميل | https://unsplash.com/s/photos/customer-journey |

يُضيف Backend الصور بجانب عناوين `h2` و`h3` داخل المحتوى المحمي فقط بعد نجاح المصادقة، ويستخدم `loading="lazy"` حتى لا تُحمّل صور العناوين البعيدة قبل الحاجة إليها. الصور زخرفية ومرفقة بنص بديل فارغ لتجنب تكرار العنوان على قارئات الشاشة.
