import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import DataJemaat from './pages/Jemaat/DataJemaat';
import EditJemaat from './pages/Jemaat/EditJemaat';
import TambahJemaat from "./pages/Jemaat/TambahJemaat";
import DataKeluarga from './pages/Jemaat/DataKeluarga';
import DataKelompokDoa from './pages/Jemaat/DataKelompokDoa';
import DataSeksi from './pages/Jemaat/DataSeksi';

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/data-jemaat" element={<DataJemaat />} />
            <Route path="/data-jemaat/tambah" element={<TambahJemaat />} />

            {/* Route Edit dengan Parameter ID (:id) */}
            <Route path="/data-jemaat/edit/:id" element={<EditJemaat />} />
            {/* Halaman Tabel Data Keluarga */}
            <Route path="/data-keluarga" element={<DataKeluarga />} />
            {/* Halaman Tabel Per Kelompok Doa (Dinamis menggunakan :kelompok) */}
            <Route path="/kelompok-doa/:kelompok" element={<DataKelompokDoa />} />
            
            <Route path="/seksi/:seksiParam" element={<DataSeksi />} />


            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
