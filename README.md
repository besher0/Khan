# Khan

هذا المستودع يضم تطبيق الموبايل والباكند كمشروعين مستقلين:

- `mobile/`: تطبيق React Native/Expo، مع نسخة ويب مبنية بواسطة Vite.
- `backend/`: واجهة Khan البرمجية المبنية بـ NestJS وPrisma.

## تشغيل تطبيق الموبايل

```bash
cd mobile
npm install
npm run native
```

لتشغيل نسخة الويب:

```bash
cd mobile
npm run web
```

لبناء نسخة الويب:

```bash
cd mobile
npm run build
```

## تشغيل الباكند

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

واجهة API متاحة تحت المسار `/api/v1`. راجع `backend/README.md` لمزيد من تفاصيل الباكند.

## مراجع التصميم

الصور وملفات PDF المرجعية موجودة في `docs/reference/` ولا تدخل ضمن ملفات التطبيق وقت التشغيل.
