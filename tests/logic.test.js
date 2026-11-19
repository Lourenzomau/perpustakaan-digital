const assert = require('assert');
const L = require('../js/logic.js');
const mk = () => ({
  books: [{ id: 'B001', judul: 'A', kategori: 'X', total: 1, stok: 1 }, { id: 'B002', judul: 'B', kategori: 'X', total: 2, stok: 2 }],
  members: [{ id: 'M001', nama: 'Budi' }], loans: [],
});
let s = mk();
const l = L.pinjam(s, { bookId: 'B001', memberId: 'M001', tgl: '2026-11-01' });
assert.strictEqual(l.jatuhTempo, '2026-11-08'); assert.strictEqual(s.books[0].stok, 0);
assert.throws(() => L.pinjam(s, { bookId: 'B001', memberId: 'M001', tgl: '2026-11-01' }), /habis/);
L.kembalikan(s, { loanId: 'L001', tgl: '2026-11-11' });
assert.strictEqual(s.loans[0].denda, 3000); assert.strictEqual(s.books[0].stok, 1);
assert.throws(() => L.kembalikan(s, { loanId: 'L001', tgl: '2026-11-12' }), /sudah/);
assert.strictEqual(L.hitungDenda('2026-11-08', '2026-11-05'), 0);
s = mk(); s.books.push({ id: 'B003', total: 1, stok: 1, kategori: 'X' }, { id: 'B004', total: 1, stok: 1, kategori: 'X' });
['B001', 'B002', 'B003'].forEach((b) => L.pinjam(s, { bookId: b, memberId: 'M001', tgl: '2026-11-01' }));
assert.throws(() => L.pinjam(s, { bookId: 'B004', memberId: 'M001', tgl: '2026-11-01' }), /maksimal/);
const r = L.ringkasan(s, '2026-11-20'); assert.strictEqual(r.terlambat, 3); assert.strictEqual(r.dipinjam, 3);
console.log('Semua tes lulus (8 assertion)');
