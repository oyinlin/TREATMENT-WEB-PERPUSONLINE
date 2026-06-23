// ========== DATA PEMINJAMAN ==========
let dataPeminjaman = [];

// Load data dari localStorage saat halaman dimuat
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

// ========== FORM HANDLER ==========
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

            // Tambah data
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
            form.reset();
            
            // Set tanggal default lagi
            document.getElementById('tanggal_pinjam').value = today;
            
            // Scroll ke tabel jika di halaman data
            if (window.location.pathname.includes('data.html')) {
                document.querySelector('.data-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Load data jika di halaman data
    if (document.getElementById('tableBody')) {
        loadData();
    }
});

// ========== RENDER TABEL ==========
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

    tbody.innerHTML = dataPeminjaman.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(item.nama)}</strong></td>
            <td>${escapeHtml(item.nim)}</td>
            <td><span style="background: rgba(44,95,45,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">${escapeHtml(item.layanan)}</span></td>
            <td>${escapeHtml(item.judul_buku)}</td>
            <td>${formatTanggal(item.tanggal_pinjam)}</td>
            <td>${item.durasi} hari</td>
            <td>${escapeHtml(item.keterangan)}</td>
            <td>
                <button class="btn-hapus" onclick="hapusData(${item.id})">🗑️ Hapus</button>
            </td>
        </tr>
    `).join('');
}

// ========== UPDATE TOTAL ==========
function updateTotal() {
    const totalSpan = document.getElementById('totalData');
    if (totalSpan) {
        totalSpan.textContent = dataPeminjaman.length;
    }
}

// ========== FUNGSI CRUD ==========
function hapusData(id) {
    if (confirm('Yakin ingin menghapus data peminjaman ini?')) {
        dataPeminjaman = dataPeminjaman.filter(item => item.id !== id);
        saveData();
        showNotifikasi('🗑️ Data berhasil dihapus!', 'success');
    }
}

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

// ========== NOTIFIKASI ==========
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

// ========== UTILITY ==========
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