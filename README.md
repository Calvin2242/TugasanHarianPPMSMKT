# Rekod Tugasan PPM (GitHub Pages + Firebase)

## 1. Firebase
1. https://console.firebase.google.com → Add project.
2. Build → Authentication → Get started → aktifkan **Email/Password** dan **Google**.
3. Authentication → Settings → **Authorized domains** → tambah `NAMAANDA.github.io`.
4. Build → Firestore Database → Create database (production mode).
5. Firestore → Rules → tampal kandungan `firestore.rules` → Publish.
6. Project settings → Your apps → Web (`</>`) → salin `firebaseConfig` ke `firebase-config.js`.
   (Config ini memang awam; keselamatan datang daripada rules di atas.)

## 2. GitHub Pages
1. Buat repo baharu, muat naik semua fail dalam folder ini ke root repo.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. Buka `https://NAMAANDA.github.io/NAMA-REPO/`.

## 3. Logo sekolah
Letakkan `logo.jpg` di root repo (sebelah `index.html`). Ia akan keluar di header dan di PDF.

Setiap pengguna hanya boleh membaca/menulis data di bawah `users/{uid}` miliknya sendiri.
