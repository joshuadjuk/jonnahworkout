import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Interface Data Jemaat dari Database
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

// Interface Khusus untuk Pengelompokan Keluarga
interface FamilyGroup {
  no_kk: string;
  kepala_keluarga: string;
  tanggal_perkawinan: string;
  alamat: string;
  kelompok_doa: string;
  anggota: Jemaat[]; // Menyimpan semua anggota keluarga di dalam KK ini
}

const DataKeluarga: React.FC = () => {
  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // STATE UNTUK MODAL DETAIL KELUARGA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyGroup | null>(null);

  const API_URL = 'https://gereja.eternity.my.id/api-gkii/jemaat.php';

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success') {
        const rawData: Jemaat[] = result.data;
        
        // --- LOGIKA PENGELOMPOKAN KELUARGA (GROUP BY NO_KK) ---
        const groupedFamilies: Record<string, FamilyGroup> = {};

        rawData.forEach((member) => {
          // Abaikan yang tidak punya No KK
          if (!member.no_kk) return; 

          if (!groupedFamilies[member.no_kk]) {
            groupedFamilies[member.no_kk] = {
              no_kk: member.no_kk,
              kepala_keluarga: 'Belum Ada Kepala Keluarga',
              tanggal_perkawinan: '-',
              alamat: member.alamat || '-',
              kelompok_doa: member.kelompok_doa || '-',
              anggota: [],
            };
          }

          // Tambahkan anggota ke dalam grup KK tersebut
          groupedFamilies[member.no_kk].anggota.push(member);

          // Jika member ini adalah Kepala Keluarga, jadikan datanya sebagai perwakilan
          if (member.hubungan_keluarga === 'Kepala Keluarga') {
            groupedFamilies[member.no_kk].kepala_keluarga = member.nama_lengkap;
            groupedFamilies[member.no_kk].tanggal_perkawinan = 
              (member.tanggal_perkawinan && member.tanggal_perkawinan !== '0000-00-00') 
                ? member.tanggal_perkawinan 
                : '-';
            // Update alamat & kelompok doa menggunakan data Kepala Keluarga (agar lebih valid)
            groupedFamilies[member.no_kk].alamat = member.alamat || '-';
            groupedFamilies[member.no_kk].kelompok_doa = member.kelompok_doa || '-';
          }
        });

        // Ubah object menjadi array agar bisa di-map
        const familyArray = Object.values(groupedFamilies);
        setFamilies(familyArray);
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (family: FamilyGroup) => {
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedFamily(null);
  };

  // Filter pencarian
  const filteredFamilies = families.filter((fam) => {
    const term = searchTerm.toLowerCase();
    return (
      fam.kepala_keluarga.toLowerCase().includes(term) ||
      fam.no_kk.toLowerCase().includes(term)
    );
  });

  // Fungsi untuk memisahkan dan mengurutkan anggota keluarga
  const getParentsAndChildren = (anggota: Jemaat[]) => {
    // Ambil Kepala Keluarga dan Istri
    const parents = anggota.filter(m => m.hubungan_keluarga === 'Kepala Keluarga' || m.hubungan_keluarga === 'Istri');
    
    // Pastikan Kepala Keluarga di atas Istri
    parents.sort((a, b) => {
      if (a.hubungan_keluarga === 'Kepala Keluarga') return -1;
      if (b.hubungan_keluarga === 'Kepala Keluarga') return 1;
      return 0;
    });

    // Ambil Anak dan Famili Lain, urutkan berdasarkan tanggal lahir (Paling tua/tanggal paling awal di atas)
    const children = anggota
      .filter(m => m.hubungan_keluarga !== 'Kepala Keluarga' && m.hubungan_keluarga !== 'Istri')
      .sort((a, b) => {
        // Jika tidak ada tanggal lahir, taruh di bawah
        if (!a.tanggal_lahir || a.tanggal_lahir === '0000-00-00') return 1;
        if (!b.tanggal_lahir || b.tanggal_lahir === '0000-00-00') return -1;
        
        return new Date(a.tanggal_lahir).getTime() - new Date(b.tanggal_lahir).getTime();
      });

    return { parents, children };
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Data Keluarga Jemaat" />

      <div className="flex flex-col gap-10">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-6 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Keluarga Jemaat
            </h4>
          </div>

          {/* Kotak Pencarian */}
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari Nama Kepala Keluarga atau No. KK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            {/* Header Tabel */}
            <div className="grid grid-cols-4 rounded-sm bg-gray-100 dark:bg-gray-800 sm:grid-cols-5 border border-gray-200 dark:border-gray-700">
              <div className="p-2.5 xl:p-5 col-span-2 sm:col-span-2"><h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Keluarga (No. KK)</h5></div>
              <div className="hidden sm:block p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Tgl Perkawinan</h5></div>
              <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Jumlah Anggota</h5></div>
              <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Aksi</h5></div>
            </div>

            {/* Isi Tabel */}
            {loading ? (
              <div className="p-5 text-center text-gray-500 border border-t-0 border-gray-200 dark:border-gray-700">Memuat data...</div>
            ) : filteredFamilies.length === 0 ? (
              <div className="p-5 text-center text-gray-500 border border-t-0 border-gray-200 dark:border-gray-700">Belum ada data keluarga.</div>
            ) : (
              filteredFamilies.map((fam, key) => (
                <div className={`grid grid-cols-4 sm:grid-cols-5 items-center border border-t-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition`} key={key}>
                  
                  {/* Kolom Nama & KK */}
                  <div className="flex flex-col gap-1 p-3 xl:p-5 col-span-2 sm:col-span-2">
                    <p className="text-black dark:text-white font-bold text-lg">Kel. {fam.kepala_keluarga}</p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">KK: {fam.no_kk}</span>
                  </div>

                  {/* Kolom Tanggal Perkawinan (Sembunyi di HP) */}
                  <div className="hidden sm:flex items-center justify-center p-3 xl:p-5">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{fam.tanggal_perkawinan}</p>
                  </div>

                  {/* Kolom Jumlah Anggota */}
                  <div className="flex items-center justify-center p-3 xl:p-5">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {fam.anggota.length} Jiwa
                    </span>
                  </div>

                  {/* KOLOM AKSI */}
                  <div className="flex items-center justify-center p-3 xl:p-5">
                    <button 
                      onClick={() => handleOpenDetail(fam)} 
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
        </div>
      </div>

      {/* ================= MODAL DETAIL KELUARGA (VIEW) ================= */}
      {isModalOpen && selectedFamily && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={handleCloseDetail}></div>
          <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl dark:bg-boxdark dark:border dark:border-strokedark flex flex-col max-h-[90vh]">
            
            {/* Header Modal - Sticky */}
            <div className="flex-shrink-0 flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Keluarga {selectedFamily.kepala_keluarga}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                    No. KK: <strong className="text-gray-900 dark:text-gray-200">{selectedFamily.no_kk}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    Kel. Doa: <strong className="text-gray-900 dark:text-gray-200">{selectedFamily.kelompok_doa}</strong>
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Alamat: <strong>{selectedFamily.alamat}</strong>
                </p>
              </div>
              <button onClick={handleCloseDetail} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body Modal - Scrollable Tabel Anggota */}
            <div className="p-6 overflow-y-auto">
              
              {(() => {
                const { parents, children } = getParentsAndChildren(selectedFamily.anggota);
                return (
                  <>
                    {/* TABEL ORANG TUA */}
                    <div className="mb-6">
                      <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">Orang Tua</h4>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-3 w-2/5">Nama Lengkap</th>
                              <th className="px-4 py-3 text-center">Hubungan</th>
                              <th className="px-4 py-3 text-center">L/P</th>
                              <th className="px-4 py-3">Tgl Lahir</th>
                              <th className="px-4 py-3">Seksi / Unsur</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parents.length > 0 ? parents.map((member, idx) => (
                              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{member.nama_lengkap}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block rounded px-2 py-1 text-xs font-semibold
                                    ${member.hubungan_keluarga === 'Kepala Keluarga' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {member.hubungan_keluarga}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">{member.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P'}</td>
                                <td className="px-4 py-3">{member.tanggal_lahir && member.tanggal_lahir !== '0000-00-00' ? member.tanggal_lahir : '-'}</td>
                                <td className="px-4 py-3">{member.seksi}</td>
                              </tr>
                            )) : (
                               <tr>
                                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">Tidak ada data Orang Tua</td>
                               </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* TABEL ANAK / FAMILI LAIN */}
                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">Anak & Famili Lain <span className="text-sm font-normal text-gray-500">({children.length} Jiwa)</span></h4>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-3 w-2/5">Nama Lengkap</th>
                              <th className="px-4 py-3 text-center">Hubungan</th>
                              <th className="px-4 py-3 text-center">L/P</th>
                              <th className="px-4 py-3">Tgl Lahir</th>
                              <th className="px-4 py-3">Seksi / Unsur</th>
                            </tr>
                          </thead>
                          <tbody>
                            {children.length > 0 ? children.map((member, idx) => (
                              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{member.nama_lengkap}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block rounded px-2 py-1 text-xs font-semibold
                                    ${member.hubungan_keluarga === 'Anak' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                    {member.hubungan_keluarga}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">{member.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P'}</td>
                                <td className="px-4 py-3">{member.tanggal_lahir && member.tanggal_lahir !== '0000-00-00' ? member.tanggal_lahir : '-'}</td>
                                <td className="px-4 py-3">{member.seksi}</td>
                              </tr>
                            )) : (
                                <tr>
                                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">Tidak ada data Anak/Famili Lain</td>
                               </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

            {/* Footer Modal */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700 flex justify-end">
              <button onClick={handleCloseDetail} className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-600 hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default DataKeluarga;