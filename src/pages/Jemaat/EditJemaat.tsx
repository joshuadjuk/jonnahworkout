import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const EditJemaat: React.FC = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State awal sesuaikan dengan Database Baru
  const [formData, setFormData] = useState({
    id: '', 
    no_kk: '',
    nama_lengkap: '',
    hubungan_keluarga: 'Kepala Keluarga',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-Laki',
    status_pernikahan: 'Belum Menikah',
    tanggal_perkawinan: '',
    status_babtis: 'Belum Babtis',
    anggota_jemaat: 'Tetap',
    seksi: 'Perkaria',
    alamat: '',
    kelompok_doa: 'Kalvari',
  });

  // Ambil Data Lama saat Halaman Dibuka
  useEffect(() => {
    const fetchOldData = async () => {
      try {
        const response = await fetch(`https://gereja.eternity.my.id/api-gkii/jemaat.php?id=${id}`);
        const json = await response.json();
        
        if (json.status === 'success' && json.data) {
          const data = json.data;
          // Isi form, antisipasi nilai null dari database agar tidak error di React
          setFormData({
            id: data.id || '',
            no_kk: data.no_kk || '',
            nama_lengkap: data.nama_lengkap || '',
            hubungan_keluarga: data.hubungan_keluarga || 'Kepala Keluarga',
            tempat_lahir: data.tempat_lahir || '',
            tanggal_lahir: data.tanggal_lahir || '',
            jenis_kelamin: data.jenis_kelamin || 'Laki-Laki',
            status_pernikahan: data.status_pernikahan || 'Belum Menikah',
            tanggal_perkawinan: data.tanggal_perkawinan && data.tanggal_perkawinan !== '0000-00-00' ? data.tanggal_perkawinan : '',
            status_babtis: data.status_babtis || 'Belum Babtis',
            anggota_jemaat: data.anggota_jemaat || 'Tetap',
            seksi: data.seksi || 'Perkaria',
            alamat: data.alamat || '',
            kelompok_doa: data.kelompok_doa || 'Kalvari',
          });
        } else {
          alert("Data tidak ditemukan");
          navigate('/data-jemaat');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchOldData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://gereja.eternity.my.id/api-gkii/jemaat.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Data Berhasil Diperbarui!');
        navigate('/data-jemaat');
      } else {
        alert('Gagal update: ' + result.message);
      }
    } catch (error) {
      alert('Error koneksi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Edit Data Jemaat" />
      
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Form Edit Data Jemaat</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6.5">
          
          {/* BAGIAN 1: IDENTITAS KELUARGA */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              1. Identitas Keluarga
            </h4>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Nomor Kartu Keluarga (KK) <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="no_kk"
                  value={formData.no_kk}
                  required
                  placeholder="Contoh: 640201..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Hubungan Keluarga
                </label>
                <select
                  name="hubungan_keluarga"
                  value={formData.hubungan_keluarga}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Famili Lain">Famili Lain</option>
                </select>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                rows={3}
                placeholder="Masukkan alamat domisili..."
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* BAGIAN 2: DATA PRIBADI */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              2. Data Pribadi
            </h4>
            
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Nama Lengkap <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                required
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                onChange={handleChange}
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Jenis Kelamin</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="jenis_kelamin" value="Laki-Laki" checked={formData.jenis_kelamin === 'Laki-Laki'} onChange={handleChange} className="w-4 h-4 text-primary" />
                  <span>Laki-Laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="jenis_kelamin" value="Perempuan" checked={formData.jenis_kelamin === 'Perempuan'} onChange={handleChange} className="w-4 h-4 text-primary" />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>
          </div>

          {/* BAGIAN 3: STATUS GEREJAWI & PERNIKAHAN */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              3. Status Gerejawi & Pernikahan
            </h4>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Status Pernikahan</label>
                <select name="status_pernikahan" value={formData.status_pernikahan} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Sudah Menikah">Sudah Menikah</option>
                  <option value="Janda">Janda</option>
                  <option value="Duda">Duda</option>
                </select>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Tanggal Perkawinan (Jika Ada)</label>
                <input
                  type="date"
                  name="tanggal_perkawinan"
                  value={formData.tanggal_perkawinan}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Status Baptis</label>
                <select name="status_babtis" value={formData.status_babtis} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Belum Babtis">Belum Babtis</option>
                  <option value="Sudah Babtis">Sudah Babtis</option>
                </select>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">Keanggotaan</label>
                <select name="anggota_jemaat" value={formData.anggota_jemaat} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Tetap">Tetap</option>
                  <option value="Simpatisan">Simpatisan</option>
                </select>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Seksi / Unsur Pelayanan</label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  name="seksi"
                  value={formData.seksi}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={handleChange}
                >
                  <option value="Sekolah Minggu">Sekolah Minggu</option>
                  <option value="Remaja">Remaja</option>
                  <option value="Pemuda">Pemuda</option>
                  <option value="Perkaria">Perkaria (Pria)</option>
                  <option value="Perkauan">Perkauan (Wanita)</option>
                  <option value="Lansia">Lansia</option>
                </select>
              </div>
            </div>
            <div className="mb-4.5 mt-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Kelompok Doa</label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  name="kelompok_doa"
                  value={formData.kelompok_doa}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={handleChange}
                >
                  <option value="Kalvari">Kalvari</option>
                  <option value="Efesus">Efesus</option>
                  <option value="Filipi">Filipi</option>
                  <option value="Imanuel">Imanuel</option>
                  <option value="Galatia">Galatia</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            {loading ? 'Menyimpan...' : 'Update Data Jemaat'}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditJemaat;