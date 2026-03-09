import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface Jemaat {
  id: number;
  no_kk: string;
  nama_lengkap: string;
  hubungan_keluarga: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  status_pernikahan: string;
  tanggal_perkawinan?: string;
  status_babtis: string;
  anggota_jemaat: string;
  seksi: string;
  alamat?: string;
  kelompok_doa: string;
}

const DataKelompokDoa: React.FC = () => {
  // Mengambil parameter dari URL (misal: "kalvari", "efesus")
  const { kelompok } = useParams<{ kelompok: string }>();
  
  // Memformat nama untuk judul (kalvari -> Kalvari)
  const namaKelompokFormat = kelompok ? kelompok.charAt(0).toUpperCase() + kelompok.slice(1) : '';

  const [members, setMembers] = useState<Jemaat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // STATE MODAL DETAIL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJemaat, setSelectedJemaat] = useState<Jemaat | null>(null);

  // STATE SEARCH & PAGINATION
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const API_URL = 'https://gereja.eternity.my.id/api-gkii/jemaat.php';

  // Fetch ulang setiap kali URL kelompok berubah (user klik menu sidebar lain)
  useEffect(() => {
    fetchMembers();
    setSearchTerm(''); // Reset pencarian saat pindah kelompok
    setCurrentPage(1); // Reset halaman ke 1
  }, [kelompok]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success') {
        const allData: Jemaat[] = result.data;
        
        // FILTER: Hanya ambil data yang kelompok_doanya sesuai dengan URL
        const filteredData = allData.filter(
          (member) => member.kelompok_doa.toLowerCase() === kelompok?.toLowerCase()
        );
        
        setMembers(filteredData);
      } else {
        console.error("Error API:", result.message);
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (member: Jemaat) => {
    setSelectedJemaat(member);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedJemaat(null);
  };

  // Logika Pencarian di dalam kelompok ini
  const searchedMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    return (
      member.nama_lengkap?.toLowerCase().includes(term) ||
      member.no_kk?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(searchedMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = searchedMembers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <PageBreadcrumb pageTitle={`Kelompok Doa ${namaKelompokFormat}`} />

      <div className="flex flex-col gap-10">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-6 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Data Jemaat - Kelompok Doa {namaKelompokFormat}
              </h4>
              <p className="text-sm text-gray-500 mt-1">Total: {members.length} Jiwa</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Cari Nama atau No. KK di kelompok ini..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-3 rounded-sm bg-gray-100 dark:bg-gray-800 sm:grid-cols-6 border border-gray-200 dark:border-gray-700">
              <div className="p-2.5 xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">No. KK & Nama</h5></div>
              <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">Hubungan</h5></div>
              <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">Seksi/Unsur</h5></div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">Gender</h5></div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">Status</h5></div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5"><h5 className="text-sm font-medium uppercase text-gray-900 dark:text-gray-200">Aksi</h5></div>
            </div>

            {loading ? (
              <div className="p-5 text-center text-gray-500 border border-t-0 border-gray-200 dark:border-gray-700">Memuat data...</div>
            ) : currentData.length === 0 ? (
              <div className="p-5 text-center text-gray-500 border border-t-0 border-gray-200 dark:border-gray-700">
                {searchTerm ? 'Data tidak ditemukan.' : `Belum ada data jemaat di Kelompok Doa ${namaKelompokFormat}.`}
              </div>
            ) : (
              currentData.map((member) => (
                <div className={`grid grid-cols-3 sm:grid-cols-6 items-center border border-t-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition`} key={member.id}>
                  
                  <div className="flex flex-col gap-1 p-2.5 xl:p-5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{member.no_kk}</span>
                    <p className="text-black dark:text-white font-medium">{member.nama_lengkap}</p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium 
                        ${member.hubungan_keluarga === 'Kepala Keluarga' ? 'bg-blue-100 text-blue-700' : 
                          member.hubungan_keluarga === 'Istri' ? 'bg-pink-100 text-pink-700' : 'bg-green-100 text-green-700'}`}>
                      {member.hubungan_keluarga}
                    </span>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{member.seksi}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="text-gray-600 dark:text-gray-400">{member.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P'}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        member.anggota_jemaat === 'Tetap' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {member.anggota_jemaat}
                    </span>
                  </div>

                  {/* KOLOM AKSI: HANYA TOMBOL LIHAT (TIDAK ADA EDIT / HAPUS) - DIPERBAIKI */}
                  <div className="flex items-center justify-center p-2.5 sm:flex xl:p-5">
                    <button 
                      onClick={() => handleOpenDetail(member)} 
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <span className="hidden sm:inline">Lihat</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {!loading && searchedMembers.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> hingga <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, searchedMembers.length)}</span> dari <span className="font-medium text-gray-900 dark:text-white">{searchedMembers.length}</span> data
              </p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Sebelumnya</button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Selanjutnya</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {isModalOpen && selectedJemaat && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={handleCloseDetail}></div>
          <div className="relative w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl dark:bg-boxdark dark:border dark:border-strokedark transform transition-all scale-100">
            <button onClick={handleCloseDetail} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Jemaat</h3>
              <p className="text-sm text-gray-500 mt-1">Informasi lengkap data anggota</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Nama Lengkap</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedJemaat.nama_lengkap}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Nomor KK</label>
                <p className="font-medium text-gray-800 dark:text-gray-200">{selectedJemaat.no_kk}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Hubungan Keluarga</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                   ${selectedJemaat.hubungan_keluarga === 'Kepala Keluarga' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                   {selectedJemaat.hubungan_keluarga}
                </span>
              </div>

              <div className="col-span-1 md:col-span-2 h-px bg-gray-200 dark:bg-gray-700"></div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tempat / Tgl Lahir</label>
                <p className="font-medium text-gray-800 dark:text-gray-200">{selectedJemaat.tempat_lahir}, {selectedJemaat.tanggal_lahir}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Jenis Kelamin</label>
                <p className="font-medium text-gray-800 dark:text-gray-200">{selectedJemaat.jenis_kelamin}</p>
              </div>

              <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Seksi / Unsur</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedJemaat.seksi}</p>
              </div>

              <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-gray-600">
                <label className="block text-xs font-bold text-green-500 uppercase tracking-wide mb-1">Kelompok Doa</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedJemaat.kelompok_doa}</p>
              </div>
              
              <div className="col-span-1 md:col-span-2 mt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Alamat Domisili</label>
                <p className="font-medium text-gray-800 dark:text-gray-200">{selectedJemaat.alamat || '-'}</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button onClick={handleCloseDetail} className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-600 hover:bg-gray-200 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataKelompokDoa;