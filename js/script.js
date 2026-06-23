// ========================================
// DATA PEMINJAMAN
// ========================================
let dataPeminjaman = [];
let editId = null; // ID yang sedang diedit

// Load data dari localStorage
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

// Simpan data ke localStorage
function saveData() {
    localStorage.setItem('dataPeminjaman', JSON.stringify(dataPeminjaman));
    renderTable();
    updateTotal();
}

// ========================================
// FORM HANDLER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Set default tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    const tanggalInput = document.getElementById('tanggal_pinjam');
    if (tanggalInput) {
        tanggalInput.value = today;
    }

    // Handle form submit
    const form = document.getElementById('formPeminjaman');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ambil data dari form
            const nama = document.getElementById('nama').value.trim();
            const nim = document.getElementById('nim').value.trim();
            const layanan = document.getElementById('layanan').value;
            const judul_buku = document.getElementById('judul_buku').value.trim();
            const tanggal_pinjam = document.getElementById('tanggal_pinjam').value;
            const durasi = document.getElementById('durasi').value || 7;
            const keterangan = document.getElementById('keterangan').value.trim();

            // Validasi
            if (!nama || !nim || !layanan || !judul_buku || !tanggal_pinjam) {
                showNotifikasi('⚠️ Semua field wajib (bertanda *) harus diisi!', 'error');
                return;
            }

            // Cek apakah sedang edit atau tambah baru
            if (editId) {
                // Mode Edit - Update data yang ada
                const index = dataPeminjaman.findIndex(item => item.id === editId);
                if (index !== -1) {
                    dataPeminjaman[index] = {
                        ...dataPeminjaman[index],
                        nama,
                        nim,
                        layanan,
                        judul_buku,
                        tanggal_pinjam,
                        durasi: parseInt(durasi),
                        keterangan: keterangan || '-'
                    };
                    saveData();
                    showNotifikasi('✅ Data berhasil diperbarui!', 'success');
                    editId = null;
                    document.querySelector('.form-actions .tombol.primary').textContent = '📥 Simpan Data';
                    document.querySelector('.form-actions .tombol.primary').classList.remove('success');
                }
            } else {
                // Mode Tambah Baru
                const newData = {
                    id: Date.now(),
                    nama,
                    nim,
                    layanan,
                    judul_buku,
                    tanggal_pinjam,
                    durasi: parseInt(durasi),
                    keterangan: keterangan || '-'
                };

                dataPeminjaman.push(newData);
                saveData();
                showNotifikasi('✅ Data peminjaman berhasil disimpan!', 'success');
            }
            
            form.reset();
            document.getElementById('tanggal_pinjam').value = today;
            
            // Reset edit mode
            editId = null;
            
            // Scroll ke tabel jika di halaman data
            if (window.location.pathname.includes('data.html')) {
                document.querySelector('.data-section').scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Reset form juga reset edit mode
        form.addEventListener('reset', function() {
            editId = null;
            document.querySelector('.form-actions .tombol.primary').textContent = '📥 Simpan Data';
            document.querySelector('.form-actions .tombol.primary').classList.remove('success');
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
        // Tentukan status badge
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
                <td><span class="status-badge" style="background:rgba(44,95,45,0.1);padding:4px 12px;border-radius:20px;font-size:0.75rem;">${escapeHtml(item.layanan)}</span></td>
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
// FITUR CRUD LENGKAP
// ========================================

// --- EDIT DATA ---
function editData(id) {
    const item = dataPeminjaman.find(data => data.id === id);
    if (!item) {
        showNotifikasi('⚠️ Data tidak ditemukan!', 'error');
        return;
    }

    // Set edit mode
    editId = id;
    
    // Isi form dengan data yang akan diedit
    const form = document.getElementById('formPeminjaman');
    if (form) {
        document.getElementById('nama').value = item.nama;
        document.getElementById('nim').value = item.nim;
        document.getElementById('layanan').value = item.layanan;
        document.getElementById('judul_buku').value = item.judul_buku;
        document.getElementById('tanggal_pinjam').value = item.tanggal_pinjam;
        document.getElementById('durasi').value = item.durasi;
        document.getElementById('keterangan').value = item.keterangan === '-' ? '' : item.keterangan;
        
        // Ubah tombol submit menjadi tombol update
        const submitBtn = document.querySelector('.form-actions .tombol.primary');
        submitBtn.textContent = '✏️ Update Data';
        submitBtn.classList.add('success');
        
        // Scroll ke form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
        showNotifikasi(`✏️ Sedang mengedit data: ${item.nama}`, 'info');
    }
}

// --- HAPUS DATA ---
function hapusData(id) {
    if (confirm('Yakin ingin menghapus data peminjaman ini?')) {
        dataPeminjaman = dataPeminjaman.filter(item => item.id !== id);
        saveData();
        showNotifikasi('🗑️ Data berhasil dihapus!', 'success');
    }
}

// --- HAPUS SEMUA DATA ---
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

// --- TAMBAH DATA DUMMY ---
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

    // Hapus data dummy sebelumnya (opsional, biar ga numpuk)
    // dataPeminjaman = dataPeminjaman.filter(item => !item.keterangan.includes('Dummy'));

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
    
    // Auto hide after 4 seconds
    clearTimeout(notif._timer);
    notif._timer = setTimeout(() => {
        notif.style.display = 'none';
    }, 4000);
}

// ========================================
// UTILITY
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTanggal(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}