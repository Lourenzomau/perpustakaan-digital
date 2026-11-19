(function () {
  'use strict';
  const KEY = 'perpus-digital-v2';
  const L = window.Logic;
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
  if (!state || !state.books) state = JSON.parse(JSON.stringify(window.SEED));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { toast('Penyimpanan browser penuh. Gunakan gambar lebih kecil.', true); return false; } };
  const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const find = (arr, id) => arr.find((x) => x.id === id);
  const bookName = (id) => (find(state.books, id) || {}).judul || '(dihapus)';
  const memName = (id) => (find(state.members, id) || {}).nama || '(dihapus)';
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.className = 'show' + (err ? ' err' : ''); clearTimeout(toast.h); toast.h = setTimeout(() => (t.className = ''), 2800); }
  const act = (fn) => { try { fn(); save(); render(); } catch (e) { toast(e.message, true); } };

  // ---------- sampul buku ----------
  function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
  function cover(b) {
    if (b.cover) return `<img src="${b.cover}" alt="Sampul ${esc(b.judul)}" onerror="App.noimg(this)" data-t="${esc(b.judul)}" data-p="${esc(b.penulis)}">`;
    return ph(b);
  }
  function ph(b) {
    const h = hue(b.judul);
    return `<div class="ph" style="background:linear-gradient(160deg,hsl(${h},45%,32%),hsl(${(h + 40) % 360},50%,22%))">${esc(b.judul)}<small>${esc(b.penulis)}</small></div>`;
  }
  function badge(b) { return b.stok > 0 ? `<span class="badge b-ok">Tersedia ${b.stok}/${b.total}</span>` : `<span class="badge b-bad">Dipinjam semua</span>`; }
  function bookCard(b) { return `<div class="book" onclick="App.detail('${b.id}')"><div class="cov">${cover(b)}</div><div class="info"><h3>${esc(b.judul)}</h3><div class="au">${esc(b.penulis)}</div>${badge(b)}</div></div>`; }
  // baca file gambar lokal, kecilkan, ubah ke data URL
  function readImage(file) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error('Pilih file gambar (JPG/PNG)'));
      const fr = new FileReader();
      fr.onerror = () => rej(new Error('Gagal membaca file'));
      fr.onload = () => { const img = new Image(); img.onerror = () => rej(new Error('Gambar tidak valid'));
        img.onload = () => { const W = 360, r = Math.min(1, W / img.width), c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); };
        img.src = fr.result; };
      fr.readAsDataURL(file);
    });
  }

  // ---------- halaman ----------
  const views = {
    beranda() {
      const r = L.ringkasan(state, today());
      const baru = [...state.books].slice(-6).reverse();
      const pop = r.top.map((t) => t.book);
      return `<section class="hero"><div class="wrap"><h1>Selamat datang di Perpustakaan Digital</h1><p>Cari, pinjam, dan kelola koleksi buku dengan mudah.</p>
        <form class="search" onsubmit="return App.cari(event)"><input id="hq" type="search" placeholder="Cari judul, penulis, atau kategori..."><button>Cari</button></form>
        <div class="facts"><div><b>${r.judul}</b><span>Judul</span></div><div><b>${r.tersedia}</b><span>Eksemplar tersedia</span></div><div><b>${r.anggota}</b><span>Anggota</span></div></div></div></section>
      <div class="wrap"><div class="sec"><h2>Koleksi Terbaru</h2><div class="sub">Buku yang baru ditambahkan ke rak</div><div class="shelf">${baru.map(bookCard).join('')}</div></div>
      ${pop.length ? `<div class="sec"><h2>Paling Sering Dipinjam</h2><div class="sub">Pilihan favorit anggota</div><div class="shelf">${pop.map(bookCard).join('')}</div></div>` : ''}
      <div class="sec"><h2>Jelajahi Kategori</h2><div class="sub">&nbsp;</div><div class="tools" style="margin-top:0">${Object.keys(r.kategori).map((k) => `<button class="sec2" onclick="App.kat('${esc(k)}')">${esc(k)} (${r.kategori[k]})</button>`).join('')}</div></div></div>`;
    },
    katalog() {
      const q = (views._q || '').toLowerCase(), cat = views._cat || '';
      const cats = [...new Set(state.books.map((b) => b.kategori))].sort();
      const rows = state.books.filter((b) => (!cat || b.kategori === cat) && (b.judul + b.penulis + b.kategori).toLowerCase().includes(q));
      return `<div class="wrap"><div class="pagehead"><h1>Katalog Buku</h1><p>${rows.length} buku ditemukan</p></div>
      <div class="tools"><input type="search" id="q" placeholder="Cari judul / penulis..." value="${esc(views._q || '')}">
        <select id="cat"><option value="">Semua kategori</option>${cats.map((c) => `<option ${c === cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <button onclick="App.formBuku()">+ Tambah Buku</button></div>
      <div class="shelf">${rows.map(bookCard).join('') || '<p class="muted">Tidak ada buku yang cocok.</p>'}</div></div>`;
    },
    anggota() {
      return `<div class="wrap"><div class="pagehead"><h1>Data Anggota</h1></div><div class="tools"><button onclick="App.formAnggota()">+ Tambah Anggota</button></div>
      <div class="card tbl-wrap"><table><tr><th>ID</th><th>Nama</th><th>Email</th><th>Telepon</th><th>Pinjaman Aktif</th><th></th></tr>
      ${state.members.map((m) => `<tr><td>${m.id}</td><td>${esc(m.nama)}</td><td>${esc(m.email)}</td><td>${esc(m.telp)}</td>
        <td>${state.loans.filter((l) => l.memberId === m.id && l.status === 'dipinjam').length}</td>
        <td><button class="sm sec2" onclick="App.formAnggota('${m.id}')">Edit</button> <button class="sm danger" onclick="App.hapusAnggota('${m.id}')">Hapus</button></td></tr>`).join('')}</table></div></div>`;
    },
    peminjaman() {
      const aktif = state.loans.filter((l) => l.status === 'dipinjam');
      const pre = views._pre || '';
      return `<div class="wrap"><div class="pagehead"><h1>Peminjaman Buku</h1><p>Aturan: maks. 3 buku per anggota, lama pinjam 7 hari, denda ${rp(L.DENDA_PER_HARI)}/hari.</p></div>
      <div class="card" style="margin-top:18px"><h3>Catat Peminjaman Baru</h3><form class="f" onsubmit="return App.pinjam(event)">
        <label>Anggota<select name="m" required>${state.members.map((m) => `<option value="${m.id}">${m.id} - ${esc(m.nama)}</option>`).join('')}</select></label>
        <label>Buku<select name="b" required>${state.books.filter((b) => b.stok > 0).map((b) => `<option value="${b.id}" ${b.id === pre ? 'selected' : ''}>${esc(b.judul)} (sisa ${b.stok})</option>`).join('')}</select></label>
        <label>Tanggal Pinjam<input type="date" name="t" value="${today()}" required></label>
        <label>Lama (hari)<input type="number" name="d" value="7" min="1" max="30"></label><button>Pinjamkan</button></form></div>
      <div class="card tbl-wrap"><h3>Sedang Dipinjam (${aktif.length})</h3>${tabelLoan(aktif)}</div></div>`;
    },
    pengembalian() {
      const aktif = state.loans.filter((l) => l.status === 'dipinjam');
      return `<div class="wrap"><div class="pagehead"><h1>Pengembalian Buku</h1></div><div class="card" style="margin-top:18px"><label style="max-width:220px">Tanggal kembali<input type="date" id="tk" value="${today()}"></label><br>
      <div class="tbl-wrap"><table><tr><th>ID</th><th>Buku</th><th>Anggota</th><th>Jatuh Tempo</th><th>Status</th><th></th></tr>
      ${aktif.map((l) => `<tr><td>${l.id}</td><td>${esc(bookName(l.bookId))}</td><td>${esc(memName(l.memberId))}</td><td>${l.jatuhTempo}</td>
        <td>${l.jatuhTempo < today() ? '<span class="badge b-bad">Terlambat</span>' : '<span class="badge b-warn">Dipinjam</span>'}</td>
        <td><button class="sm" onclick="App.kembali('${l.id}')">Kembalikan</button></td></tr>`).join('') || '<tr><td colspan=6 class="muted">Tidak ada pinjaman aktif.</td></tr>'}</table></div></div></div>`;
    },
    laporan() {
      const r = L.ringkasan(state, today());
      return `<div class="wrap"><div class="pagehead"><h1>Laporan Perpustakaan</h1></div>
      <div class="tools"><button onclick="App.csv()">⬇ Ekspor CSV</button><button class="sec2" onclick="window.print()">🖨 Cetak</button></div>
      <div class="stats">${stat('Judul Buku', r.judul)}${stat('Eksemplar', r.eksemplar)}${stat('Sedang Dipinjam', r.dipinjam)}${stat('Terlambat', r.terlambat, r.terlambat ? 'bad' : '')}${stat('Total Transaksi', state.loans.length)}${stat('Total Denda', rp(r.totalDenda))}</div>
      <div class="card tbl-wrap"><h3>Riwayat Transaksi</h3>${tabelLoan([...state.loans].reverse(), true)}</div></div>`;
    },
  };
  function stat(l, v, c) { return `<div class="stat ${c || ''}"><span>${l}</span><b>${v}</b></div>`; }
  function tabelLoan(ls, all) {
    return `<table><tr><th>ID</th><th>Buku</th><th>Anggota</th><th>Pinjam</th><th>Jatuh Tempo</th>${all ? '<th>Kembali</th><th>Denda</th>' : ''}<th>Status</th></tr>
    ${ls.map((l) => { const late = l.status === 'dipinjam' && l.jatuhTempo < today(); const bk = find(state.books, l.bookId);
      return `<tr><td>${l.id}</td><td>${bk ? `<span class="thumb">${cover(bk)}</span>` : ''}${esc(bookName(l.bookId))}</td><td>${esc(memName(l.memberId))}</td><td>${l.tglPinjam}</td><td>${l.jatuhTempo}</td>${all ? `<td>${l.tglKembali || '-'}</td><td>${l.denda ? rp(l.denda) : '-'}</td>` : ''}
      <td><span class="badge ${l.status === 'dikembalikan' ? 'b-ok' : late ? 'b-bad' : 'b-warn'}">${late ? 'Terlambat' : l.status}</span></td></tr>`; }).join('') || `<tr><td colspan=9 class="muted">Belum ada data.</td></tr>`}</table>`;
  }
  function modal(html) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box">${html}</div>`; m.addEventListener("click", (e) => { if (e.target === m) m.remove(); }); document.body.appendChild(m); return m; }

  function render() {
    const v = (location.hash || '#beranda').slice(1); const name = views[v] ? v : 'beranda';
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.v === name));
    $('#view').innerHTML = views[name]();
    const q = $('#q'); if (q) { q.oninput = () => { views._q = q.value; const p = q.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); }; $('#cat').onchange = (e) => { views._cat = e.target.value; render(); }; }
  }

  window.App = {
    noimg(el) { const b = { judul: el.dataset.t, penulis: el.dataset.p }; el.outerHTML = ph(b); },
    cari(e) { e.preventDefault(); views._q = $('#hq').value; views._cat = ''; location.hash = '#katalog'; render(); return false; },
    kat(k) { views._cat = k; views._q = ''; location.hash = '#katalog'; render(); },
    detail(id) {
      const b = find(state.books, id); if (!b) return;
      const m = modal(`<div class="detail"><div class="cov">${cover(b)}</div><div><h2>${esc(b.judul)}</h2>${badge(b)}
        <dl><dt>Penulis</dt><dd>${esc(b.penulis)}</dd><dt>Kategori</dt><dd>${esc(b.kategori)}</dd><dt>Tahun</dt><dd>${b.tahun}</dd><dt>ID Buku</dt><dd>${b.id}</dd><dt>Eksemplar</dt><dd>${b.stok} tersedia dari ${b.total}</dd></dl>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${b.stok > 0 ? `<button id="dp">Pinjam Buku Ini</button>` : ''}<button class="sec2" id="de">Edit</button><button class="danger" id="dh">Hapus</button></div></div></div>`);
      const pj = m.querySelector('#dp'); if (pj) pj.onclick = () => { views._pre = id; m.remove(); location.hash = '#peminjaman'; render(); };
      m.querySelector('#de').onclick = () => { m.remove(); App.formBuku(id); };
      m.querySelector('#dh').onclick = () => { if (!confirm('Hapus buku ini?')) return; m.remove(); act(() => { if (state.loans.some((l) => l.bookId === id && l.status === 'dipinjam')) throw new Error('Buku sedang dipinjam'); state.books = state.books.filter((x) => x.id !== id); toast('Buku dihapus'); }); };
    },
    formBuku(id) {
      const b = find(state.books, id) || { judul: '', penulis: '', kategori: '', tahun: new Date().getFullYear(), total: 1, cover: '' };
      let img = b.cover || '';
      const m = modal(`<h3 style="font-family:Georgia,serif;font-size:20px;margin-bottom:14px">${id ? 'Edit' : 'Tambah'} Buku</h3><form class="f" id="fb">
        <div class="upl"><div class="cov" id="pv">${cover({ ...b, cover: img })}</div><div class="acts"><label style="margin:0">Gambar sampul (dari laptop)</label>
          <input type="file" id="file" accept="image/*"><button type="button" class="sm sec2" id="rm">Hapus gambar</button></div></div>
        <label>Judul<input name="judul" required value="${esc(b.judul)}"></label><label>Penulis<input name="penulis" required value="${esc(b.penulis)}"></label>
        <label>Kategori<input name="kategori" required value="${esc(b.kategori)}"></label><label>Tahun<input type="number" name="tahun" value="${b.tahun}"></label>
        <label>Jumlah Eksemplar<input type="number" name="total" min="1" value="${b.total}"></label><button>Simpan</button></form>`);
      const pv = () => (m.querySelector('#pv').innerHTML = cover({ ...b, judul: m.querySelector('[name=judul]').value || 'Judul Buku', penulis: m.querySelector('[name=penulis]').value, cover: img }));
      m.querySelector('#file').onchange = async (e) => { try { img = await readImage(e.target.files[0]); pv(); } catch (er) { toast(er.message, true); } };
      m.querySelector('#rm').onclick = () => { img = ''; m.querySelector('#file').value = ''; pv(); };
      m.querySelector('#fb').onsubmit = (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); delete f.undefined;
        act(() => { f.tahun = +f.tahun; f.total = +f.total; f.cover = img;
          if (id) { const dipinjam = b.total - b.stok; if (f.total < dipinjam) throw new Error('Eksemplar kurang dari yang sedang dipinjam'); Object.assign(b, f, { stok: f.total - dipinjam }); }
          else state.books.push({ id: L.nextId(state.books, 'B'), ...f, stok: f.total });
          if (!save()) throw new Error('Gagal menyimpan'); m.remove(); toast('Buku disimpan'); }); };
    },
    formAnggota(id) {
      const a = find(state.members, id) || { nama: '', email: '', telp: '' };
      const m = modal(`<h3 style="font-family:Georgia,serif;font-size:20px;margin-bottom:14px">${id ? 'Edit' : 'Tambah'} Anggota</h3><form class="f" id="fa"><label>Nama<input name="nama" required value="${esc(a.nama)}"></label>
        <label>Email<input type="email" name="email" value="${esc(a.email)}"></label><label>Telepon<input name="telp" value="${esc(a.telp)}"></label><button>Simpan</button></form>`);
      m.querySelector('#fa').onsubmit = (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
        act(() => { if (id) Object.assign(a, f); else state.members.push({ id: L.nextId(state.members, 'M'), ...f }); m.remove(); toast('Anggota disimpan'); }); };
    },
    hapusAnggota(id) { if (!confirm('Hapus anggota ini?')) return; act(() => { if (state.loans.some((l) => l.memberId === id && l.status === 'dipinjam')) throw new Error('Anggota masih memiliki pinjaman'); state.members = state.members.filter((m) => m.id !== id); }); },
    pinjam(e) { e.preventDefault(); const f = new FormData(e.target); act(() => { const l = L.pinjam(state, { bookId: f.get('b'), memberId: f.get('m'), tgl: f.get('t'), lamaHari: +f.get('d') || 7 }); views._pre = ''; toast(`Berhasil. Jatuh tempo ${l.jatuhTempo}`); }); return false; },
    kembali(id) { act(() => { const l = L.kembalikan(state, { loanId: id, tgl: $('#tk').value || today() }); toast(l.denda ? `Dikembalikan. Denda ${rp(l.denda)}` : 'Dikembalikan tepat waktu'); }); },
    csv() {
      const rows = [['ID', 'Buku', 'Anggota', 'Tgl Pinjam', 'Jatuh Tempo', 'Tgl Kembali', 'Denda', 'Status'], ...state.loans.map((l) => [l.id, bookName(l.bookId), memName(l.memberId), l.tglPinjam, l.jatuhTempo, l.tglKembali || '', l.denda, l.status])];
      const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'laporan-perpustakaan.csv'; a.click();
    },
  };
  window.addEventListener('hashchange', render);
  render();
})();
