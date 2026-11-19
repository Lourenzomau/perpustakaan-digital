/* Logika bisnis perpustakaan (murni, tanpa DOM) - dipakai browser & Node (tes) */
(function (root) {
  const DENDA_PER_HARI = 1000;
  const MS = 86400000;
  const toDate = (s) => new Date(s + 'T00:00:00');
  const fmt = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => fmt(new Date(toDate(s).getTime() + n * MS + 12 * 3600e3));
  const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / MS);
  const hitungDenda = (jatuhTempo, tglKembali, tarif = DENDA_PER_HARI) =>
    Math.max(0, daysBetween(jatuhTempo, tglKembali)) * tarif;
  const nextId = (arr, p) => p + String(arr.reduce((m, x) => Math.max(m, parseInt(x.id.slice(p.length), 10) || 0), 0) + 1).padStart(3, '0');

  function pinjam(state, { bookId, memberId, tgl, lamaHari = 7 }) {
    const book = state.books.find((b) => b.id === bookId);
    const member = state.members.find((m) => m.id === memberId);
    if (!book) throw new Error('Buku tidak ditemukan');
    if (!member) throw new Error('Anggota tidak ditemukan');
    if (book.stok < 1) throw new Error('Stok buku habis');
    const aktif = state.loans.filter((l) => l.memberId === memberId && l.status === 'dipinjam');
    if (aktif.length >= 3) throw new Error('Anggota sudah meminjam 3 buku (batas maksimal)');
    if (aktif.some((l) => l.bookId === bookId)) throw new Error('Anggota sudah meminjam buku ini');
    book.stok -= 1;
    const loan = { id: nextId(state.loans, 'L'), bookId, memberId, tglPinjam: tgl, jatuhTempo: addDays(tgl, lamaHari), tglKembali: null, denda: 0, status: 'dipinjam' };
    state.loans.push(loan);
    return loan;
  }

  function kembalikan(state, { loanId, tgl }) {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Transaksi tidak ditemukan');
    if (loan.status === 'dikembalikan') throw new Error('Buku sudah dikembalikan');
    loan.tglKembali = tgl;
    loan.denda = hitungDenda(loan.jatuhTempo, tgl);
    loan.status = 'dikembalikan';
    const book = state.books.find((b) => b.id === loan.bookId);
    if (book) book.stok += 1;
    return loan;
  }

  function ringkasan(state, hariIni) {
    const aktif = state.loans.filter((l) => l.status === 'dipinjam');
    const terlambat = aktif.filter((l) => l.jatuhTempo < hariIni);
    const populer = {};
    state.loans.forEach((l) => (populer[l.bookId] = (populer[l.bookId] || 0) + 1));
    const top = Object.entries(populer).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, n]) => ({ book: state.books.find((b) => b.id === id), n })).filter((x) => x.book);
    const kategori = {};
    state.books.forEach((b) => (kategori[b.kategori] = (kategori[b.kategori] || 0) + b.total));
    return {
      judul: state.books.length,
      eksemplar: state.books.reduce((s, b) => s + b.total, 0),
      tersedia: state.books.reduce((s, b) => s + b.stok, 0),
      anggota: state.members.length,
      dipinjam: aktif.length,
      terlambat: terlambat.length,
      totalDenda: state.loans.reduce((s, l) => s + (l.denda || 0), 0),
      top, kategori,
    };
  }

  const api = { DENDA_PER_HARI, addDays, daysBetween, hitungDenda, nextId, pinjam, kembalikan, ringkasan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
