/* DATA AWAL BUKU
   Untuk sampul permanen (ikut ter-upload ke GitHub):
   1. Taruh file gambar di folder  images/  dengan nama persis seperti pada baris buku di bawah
   2. Semua buku sudah punya baris cover. Jika file belum ada, sampul warna otomatis tampil.
   Data awal ini hanya dipakai saat browser masih kosong. Jika data sudah tersimpan,
   buka katalog lalu jalankan di Console browser:  localStorage.clear(); location.reload()  */
window.SEED = {
  books: [
    { id: 'B001', judul: 'Cloud Computing: Concepts, Technology & Architecture', penulis: 'Thomas Erl', kategori: 'Komputasi', tahun: 2013, total: 3, stok: 3, cover: 'images/cloud-computing.jpg' },
    { id: 'B002', judul: 'Distributed Systems', penulis: 'Andrew S. Tanenbaum', kategori: 'Komputasi', tahun: 2017, total: 2, stok: 2, cover: 'images/distributed-systems.jpg' },
    { id: 'B003', judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', kategori: 'Novel', tahun: 2005, total: 4, stok: 4, cover: 'images/laskar-pelangi.jpg' },
    { id: 'B004', judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', kategori: 'Novel', tahun: 1980, total: 3, stok: 3, cover: 'images/bumi-manusia.jpg' },
    { id: 'B005', judul: 'Clean Code', penulis: 'Robert C. Martin', kategori: 'Pemrograman', tahun: 2008, total: 2, stok: 2, cover: 'images/clean-code.jpg' },
    { id: 'B006', judul: 'Basis Data: Konsep dan Perancangan', penulis: 'Fathansyah', kategori: 'Pemrograman', tahun: 2015, total: 3, stok: 3, cover: 'images/basis-data.jpg' },
    { id: 'B007', judul: 'Sapiens: Riwayat Singkat Umat Manusia', penulis: 'Yuval Noah Harari', kategori: 'Sejarah', tahun: 2011, total: 2, stok: 2, cover: 'images/sapiens.jpg' },
    { id: 'B008', judul: 'Atomic Habits', penulis: 'James Clear', kategori: 'Pengembangan Diri', tahun: 2018, total: 3, stok: 3, cover: 'images/atomic-habits.jpg' }
  ],
  members: [
    { id: 'M001', nama: 'Budi Santoso', email: 'budi@mail.com', telp: '081234567890' },
    { id: 'M002', nama: 'Siti Rahma', email: 'siti@mail.com', telp: '081298765432' },
    { id: 'M003', nama: 'Andi Pratama', email: 'andi@mail.com', telp: '082111222333' }
  ],
  loans: []
};
