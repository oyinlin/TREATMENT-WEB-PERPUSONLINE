// ========================================
// DATA PEMINJAMAN
// ========================================
let dataPeminjaman = [];
let editId = null;

function loadData() {
    const stored = localStorage.getItem('dataPeminjaman');
    if (stored) {
        try {
            dataPeminjaman = JSON.parse(stored);
        } catch (e) {
            dataPeminjaman = [];
        }
    }
    renderTable();
    updateTotal();
}

function saveData() {
    localStorage.setItem('dataPeminjaman', JSON.stringify(dataPeminjaman));
    renderTable();
    updateTotal();
}

// ========================================
// CEK EDIT DARI SESSION STORAGE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Set default tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    const tanggalInput = document.getElementById('tanggal_pinjam');
    if (tanggalInput) {
        tanggalInput.value = today;
    }

    // CEK: Apakah ada data yang mau diedit dari sessionStorage?
    const editIdFromSession = sessionStorage.getItem('editId');
    if (editIdFromSession && window.location.pathname.includes('form.html')) {
        const id = parseInt(editIdFromSession);
        // Load data dulu dari localStorage
        const stored = localStorage.getItem('dataPeminjaman');
        if (stored) {
            try {
                dataPeminjaman = JSON.parse(stored);
                const item = dataPeminjaman.find(data => data.id === id);
                if (item) {
                    editId = id;
                    // Isi form dengan data
                    document.getElementById('nama').value = item.nama;
                    document.getElementById('nim').value = item.nim;
                    document.getElementById('layanan').value = item.layanan;
                    document.getElementById('judul_buku').value = item.judul_buku;
                    document.getElementById('tanggal_pinjam').value = item.tanggal_pinjam;
                    document.getElementById('durasi').value = item.durasi;
                    document.getElementById('keterangan').value = item.keterangan === '-' ? '' : item.keterangan;
                    
                    // Ubah tombol submit
                    const submitBtn = document.querySelector('.form-actions .tombol.primary');
                    if (submitBtn) {
                        submitBtn.innerHTML = '✏️ Update Data';
                        submitBtn.className = 'tombol primary success';
                    }
                    
                    // Ubah judul
                    const formTitle = document.querySelector('.form-section h2');
                    if (formTitle) {
                        formTitle.innerHTML = '✏️ Edit Data Peminjaman';
                    }
                    
                    showNotifikasi(`✏️ Sedang mengedit data: ${item.nama}`, 'info');
                }
            } catch (e) {
                console.log('Error loading data:', e);
            }
        }
        // Hapus sessionStorage setelah digunakan
        sessionStorage.removeItem('editId');
    }

    // Handle form submit
    const form = document.getElementById('formPeminjaman');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nama = document.getElementById('nama').value.trim();
            const nim = document.getElementById('nim').value.trim();
            const layanan = document.getElementById('layanan').value;
            const judul_buku = document.getElementById('judul_buku').value.trim();
            const tanggal_pinjam = document.getElementById('tanggal_pinjam').value;
            const durasi = document.getElementById('durasi').value || 7;
            const keterangan = document.getElementById('keterangan').value.trim();

            if (!nama || !nim || !layanan || !judul_buku || !tanggal_pinjam) {
                showNotifikasi('⚠️ Semua field wajib (bertanda *) harus diisi!', 'error');
                return;
            }

            // Cek apakah sedang edit atau tambah baru
            if (editId !== null && editId !== undefined) {
                // Mode Edit - Update data yang ada
                const index = dataPeminjaman.findIndex(item => item.id === editId);
                if (index !== -1) {
                    dataPeminjaman[index] = {
                        id: editId,
                        nama: nama,
                        nim: nim,
                        layanan: layanan,
                        judul_buku: judul_buku,
                        tanggal_pinjam: tanggal_pinjam,
                        durasi: parseInt(durasi),
                        keterangan: keterangan || '-'
                    };
                    saveData();
                    showNotifikasi('✅ Data berhasil diperbarui!', 'success');
                    editId = null;
                    
                    // Reset tombol submit
                    const submitBtn = document.querySelector('.form-actions .tombol.primary');
                    if (submitBtn) {
                        submitBtn.innerHTML = '📥 Simpan Data';
                        submitBtn.className = 'tombol primary';
                    }
                    
                    // Reset judul
                    const formTitle = document.querySelector('.form-section h2');
                    if (formTitle) {
                        formTitle.innerHTML = '📝 Form Peminjaman Buku';
                    }
                    
                    // Redirect ke data.html setelah 1.5 detik
                    setTimeout(() => {
                        window.location.href = 'data.html';
                    }, 1500);
                } else {
                    showNotifikasi('⚠️ Data tidak ditemukan!', 'error');
                    editId = null;
                }
            } else {
                // Mode Tambah Baru
                const newData = {
                    id: Date.now(),
                    nama: nama,
                    nim: nim,
                    layanan: layanan,
                    judul_buku: judul_buku,
                    tanggal_pinjam: tanggal_pinjam,
                    durasi: parseInt(durasi),
                    keterangan: keterangan || '-'
                };

                dataPeminjaman.push(newData);
                saveData();
                showNotifikasi('✅ Data peminjaman berhasil disimpan!', 'success');
            }
            
            if (editId === null) {
                form.reset();
                document.getElementById('tanggal_pinjam').value = today;
            }
        });

        // Reset form
        form.addEventListener('reset', function() {
            editId = null;
            const submitBtn = document.querySelector('.form-actions .tombol.primary');
            if (submitBtn) {
                submitBtn.innerHTML = '📥 Simpan Data';
                submitBtn.className = 'tombol primary';
            }
            const formTitle = document.querySelector('.form-section h2');
            if (formTitle) {
                formTitle.innerHTML = '📝 Form Peminjaman Buku';
            }
            showNotifikasi('🔄 Form telah direset', 'info');
        });
    }

    // Load data jika di halaman data
    if (document.getElementById('tableBody')) {
        loadData();
    }
});

// ========================================
// RENDER TABEL
// ========================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (dataPeminjaman.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-data">📭 Belum ada data peminjaman. Silakan tambahkan data melalui form.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = dataPeminjaman.map((item, index) => {
        let statusClass = 'active';
        let statusText = 'Aktif';
        const today = new Date();
        const pinjamDate = new Date(item.tanggal_pinjam + 'T00:00:00');
        const diffDays = Math.floor((today - pinjamDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > item.durasi) {
            statusClass = 'completed';
            statusText = 'Selesai';
        } else if (diffDays > item.durasi - 3) {
            statusClass = 'pending';
            statusText = 'Segera Kembali';
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(item.nama)}</strong></td>
                <td>${escapeHtml(item.nim)}</td>
                <td><span style="background:rgba(44,95,45,0.1);padding:4px 12px;border-radius:20px;font-size:0.75rem;display:inline-block;">${escapeHtml(item.layanan)}</span></td>
                <td>${escapeHtml(item.judul_buku)}</td>
                <td>${formatTanggal(item.tanggal_pinjam)}</td>
                <td>${item.durasi} hari</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="btn-aksi edit" onclick="editData(${item.id})">
                            ✏️ <span>Edit</span>
                        </button>
                        <button class="btn-aksi hapus" onclick="hapusData(${item.id})">
                            🗑️ <span>Hapus</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// UPDATE TOTAL
// ========================================
function updateTotal() {
    const totalSpan = document.getElementById('totalData');
    if (totalSpan) {
        totalSpan.textContent = dataPeminjaman.length;
    }
}

// ========================================
// EDIT DATA - Auto Redirect ke Form
// ========================================
function editData(id) {
    console.log('Edit data dengan ID:', id);
    
    // Cari data berdasarkan ID
    const item = dataPeminjaman.find(data => data.id === id);
    if (!item) {
        showNotifikasi('⚠️ Data tidak ditemukan!', 'error');
        return;
    }

    console.log('Data yang diedit:', item);

    // Simpan ID ke sessionStorage
    sessionStorage.setItem('editId', id);
    
    // Redirect ke halaman form
    window.location.href = 'form.html';
}

// ========================================
// HAPUS DATA
// ========================================
function hapusData(id) {
    if (confirm('Yakin ingin menghapus data peminjaman ini?')) {
        dataPeminjaman = dataPeminjaman.filter(item => item.id !== id);
        saveData();
        showNotifikasi('🗑️ Data berhasil dihapus!', 'success');
    }
}

// ========================================
// HAPUS SEMUA DATA
// ========================================
function hapusSemuaData() {
    if (dataPeminjaman.length === 0) {
        showNotifikasi('📭 Tidak ada data untuk dihapus.', 'error');
        return;
    }
    
    if (confirm('⚠️ Yakin ingin menghapus SEMUA data peminjaman? Tindakan ini tidak bisa dibatalkan!')) {
        dataPeminjaman = [];
        saveData();
        showNotifikasi('🗑️ Semua data berhasil dihapus!', 'success');
    }
}

// ========================================
// TAMBAH DATA DUMMY
// ========================================
function tambahDataDummy() {
    const dummyNames = ['Ahmad Fauzi', 'Siti Rahma', 'Budi Santoso', 'Dewi Lestari', 'Rizky Ramadhan'];
    const dummyBooks = ['Laskar Pelangi', 'Bumi Manusia', 'Sang Pemimpi', 'Perahu Kertas', 'Dilan: Dia adalah Dilanku'];
    const dummyServices = ['Peminjaman Buku Fisik', 'Peminjaman E-Book', 'Klub Baca', 'Ruangan Baca', 'Konsultasi Literasi'];
    const dummyNIM = ['20241001', '20241002', '20241003', '20241004', '20241005'];
    
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return date.toISOString().split('T')[0];
    };

    // Hapus data dummy sebelumnya
    dataPeminjaman = dataPeminjaman.filter(item => !item.keterangan.includes('Dummy'));

    for (let i = 0; i < 5; i++) {
        const newData = {
            id: Date.now() + i,
            nama: randomItem(dummyNames),
            nim: randomItem(dummyNIM),
            layanan: randomItem(dummyServices),
            judul_buku: randomItem(dummyBooks),
            tanggal_pinjam: randomDate(),
            durasi: Math.floor(3 + Math.random() * 10),
            keterangan: 'Data dummy untuk demo'
        };
        dataPeminjaman.push(newData);
    }
    
    saveData();
    showNotifikasi('✅ 5 data dummy berhasil ditambahkan!', 'success');
}

// ========================================
// NOTIFIKASI
// ========================================
function showNotifikasi(message, type = 'success') {
    const notif = document.getElementById('notifikasi');
    if (!notif) return;
    
    notif.textContent = message;
    notif.className = `notifikasi ${type}`;
    notif.style.display = 'block';
    
    clearTimeout(notif._timer);
    notif._timer = setTimeout(() => {
        notif.style.display = 'none';
    }, 4000);
}

// ========================================
// UTILITY
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTanggal(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}
/**
 * ==================== RIWAYAT.JS - VERSI ERROR ====================
 * File ini sengaja dibuat dengan ERROR LOGIKA (bukan typo).
 * Semua sintaks benar, tapi fungsinya ga jalan!
 * 
 * Penulis: KlinikSehat Team
 * Tanggal: 2026
 * ================================================================
 */

// ============================================================
// ERROR 1: Fungsi format tanggal pake variabel yang salah
// ============================================================
function formatTanggal(str) {
    if (!str) return '';
    const d = new Date(str + 'T00:00:00');
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    // ❌ ERROR: pake "d.getMonth" tanpa kurung, jadi ga jalan
    return d.getDate() + ' ' + bulan[d.getMonth] + ' ' + d.getFullYear(); // ❌ ERROR!
}

// ============================================================
// ERROR 2: Nama variabel bentrok (conflict)
// ============================================================
function isRiwayatPage() {
    // ❌ ERROR: variable "riwayat" kebentrok sama nama fungsi
    const riwayat = document.getElementById('kontenRiwayat');
    return riwayat !== null;
}

// ============================================================
// ERROR 3: Async/await ga sengaja kepake, padahal ga perlu
// ============================================================
async function tampilkanRiwayat() { // ❌ ERROR: async ga perlu
    if (!isRiwayatPage()) return;
    
    // ❌ ERROR: pake await padahal ga ada promise
    const riwayat = await localStorage.getItem('kliniksehat_riwayat'); // ❌ ERROR!
    riwayat = riwayat ? JSON.parse(riwayat) : [];

    const kontainer = document.getElementById('kontenRiwayat');
    if (!kontainer) return;

    if (riwayat.length === 0) {
        kontainer.innerHTML = `
            <div class="riwayat-kosong">
                <div class="icon-kosong">📋</div>
                <p>Belum ada janji temu. Yuk, buat janji di KlinikSehat!</p>
                <a href="pesanan.html" class="btn-ke-layanan">Buat Janji Sekarang</a>
            </div>
        `;
        const btnHapusSemua = document.getElementById('btnHapusSemua');
        if (btnHapusSemua) btnHapusSemua.style.display = 'none';
        return;
    }

    // ❌ ERROR: pake "var" tapi ga ada di scope yang benar
    var html = `<p style="color:#64748b;margin-bottom:0.8rem;">Menampilkan ${riwayat.length} data janji temu</p>`;
    html += `<div class="tabel-wrapper">`;
    html += `<table class="tabel-riwayat">`;
    html += `<thead>`;
    html += `<tr>`;
    html += `<th>No</th>`;
    html += `<th>Nama Pasien</th>`;
    html += `<th>Layanan</th>`;
    html += `<th>Dokter</th>`;
    html += `<th>Tanggal</th>`;
    html += `<th>Waktu</th>`;
    html += `<th>Harga</th>`;
    html += `<th>Status</th>`;
    html += `<th>Aksi</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;

    for (let i = 0; i < riwayat.length; i++) {
        const item = riwayat[i];
        const hargaStr = item.harga ? 'Rp ' + item.harga.toLocaleString('id-ID') : '-';

        html += `<tr>`;
        html += `<td><span class="no-urut">${i + 1}</span></td>`;
        html += `<td class="nama-pasien">${item.nama}</td>`;
        html += `<td>${item.layanan}</td>`;
        html += `<td>${item.dokter || '-'}</td>`;
        html += `<td>${formatTanggal(item.tanggal)}</td>`;
        html += `<td>${item.waktu}</td>`;
        html += `<td class="harga-text">${hargaStr}</td>`;
        html += `<td><span class="badge-status">✅ ${item.status}</span></td>`;
        html += `<td>`;
        html += `<div class="aksi-button">`;
        html += `<button class="btn-edit" data-id="${item.id}">✏️ Edit</button>`;
        html += `<button class="btn-hapus" data-id="${item.id}">🗑️ Hapus</button>`;
        html += `</div>`;
        html += `</td>`;
        html += `</tr>`;
    }

    html += `</tbody>`;
    html += `</table>`;
    html += `</div>`;
    kontainer.innerHTML = html;
}

// ============================================================
// ERROR 4: Fungsi edit malah manggil dirinya sendiri (rekursi tak berujung)
// ============================================================
function editPesanan(id) {
    // ❌ ERROR: manggil dirinya sendiri tanpa kondisi berhenti
    editPesanan(id); // ❌ ERROR! Stack overflow!
}

// ============================================================
// ERROR 5: Hapus semua tapi malah nambah data
// ============================================================
function hapusSemua() {
    if (confirm('⚠️ Yakin ingin menghapus SEMUA riwayat?')) {
        // ❌ ERROR: malah set item, bukan remove
        localStorage.setItem('kliniksehat_riwayat', JSON.stringify([])); // ❌ ERROR!
        // ❌ ERROR: ga panggil tampilkanRiwayat()
        alert('✅ Semua riwayat berhasil dihapus!');
    }
}

// ============================================================
// ERROR 6: Hapus per data malah hapus yang salah
// ============================================================
function hapusPesanan(id) {
    if (!confirm('Yakin ingin menghapus janji ini?')) return;

    let riwayat = localStorage.getItem('kliniksehat_riwayat');
    riwayat = riwayat ? JSON.parse(riwayat) : [];

    // ❌ ERROR: langsung hapus index pertama, bukan yang sesuai ID
    riwayat.splice(0, 1); // ❌ ERROR!
    localStorage.setItem('kliniksehat_riwayat', JSON.stringify(riwayat));
    tampilkanRiwayat();
    alert('✅ Janji berhasil dihapus!');
}

// ============================================================
// ERROR 7: Tombol Hapus Semua ga ke-binding
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 KlinikSehat - Riwayat siap');
    
    if (isRiwayatPage()) {
        tampilkanRiwayat();

        // ❌ ERROR: pake selector yang salah (class vs id)
        const btnHapusSemua = document.querySelector('.btnHapusSemua'); // ❌ ERROR!
        if (btnHapusSemua) {
            btnHapusSemua.onclick = hapusSemua;
        }

        // ❌ ERROR: event listener di document.body tapi ga nge-check target
        document.body.addEventListener('click', function(e) {
            // ❌ ERROR: ga ada pengecekan target
            const id = e.target.dataset.id;
            // ❌ ERROR: ga ngecek tombol apa yang diklik
            alert('Tombol diklik!'); // ❌ ERROR!
        });
    }
});