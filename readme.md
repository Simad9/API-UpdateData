# ITC::Back-End Tugas-4

Perintah : Mengupdate database, data yang diubah fullName, nim, angkatan, dan profilePicture\
\

## Setup Project

1. **Clone** repository ini
2. Buka **xampp** kemudian jalankan **mysql** dan **apache**
3. Install dependency dengan cara mengetik `npm i` di terminal atau cmd, tunggu sampai selesai.
4. Jalankan service dengan cara mengetik `npx nodemon app`
5. Jalankan < force: true > pada file /util/assoc_db.js didalam options < await my_db.sync > kemudian tunggu tabel terbuat
6. Pastikan terdapat database dengan nama **data_itc** yang memiliki dua tabel yaitu **users** dan **divisions**
7. Apabila database dan tabel''nya telah terbuat, jalankan < force: false > pada file /util/assoc_db.js didalam options < await my_db.sync >
8. Uncomment < Division.bulkCreate > & < await User.create > dalam fungsi association pada file /util/assoc_db.js.
9. Pada database **divisions** pastikan terdapat data divisi'' itc yaitu WEB DEV, MOBILE DEV, dll. Pastikan juga database **user** telah terisi data seva
10. comment < Division.bulkCreate > & < await User.create > dalam fungsi association pada file /util/assoc_db.js. Agar data tidak tergenerate secara terus menerus di tabel ketika merestart server.
