import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

// Interface untuk data mentah dari API
interface Jemaat {
  id: number;
  nama_lengkap: string;
  tanggal_lahir: string | null;
  status_pernikahan: string;
  tanggal_perkawinan: string | null;
  hubungan_keluarga: string;
  no_kk: string;
}

// Interface khusus untuk Event Kalender kita
interface CalendarEvent extends EventInput {
  extendedProps: {
    type: "Ulang Tahun" | "Pernikahan";
    originalDate: string; // Tanggal lahir/nikah asli (Tahun jadul)
    ageOrAnniversary: number; // Ulang tahun ke-berapa
    memberData: Jemaat; // Simpan data utuh jemaatnya
    partnerName?: string; // Khusus untuk pernikahan (Nama Suami/Istri)
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const API_URL = "https://gereja.eternity.my.id/api-gkii/jemaat.php";

  // Ambil Data saat halaman dimuat
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.status === "success") {
        const rawData: Jemaat[] = result.data;
        const currentYear = new Date().getFullYear();
        const calendarEvents: CalendarEvent[] = [];

        rawData.forEach((member) => {
          // --- 1. PROSES DATA ULANG TAHUN ---
          if (member.tanggal_lahir && member.tanggal_lahir !== "0000-00-00") {
            const birthDate = new Date(member.tanggal_lahir);
            const birthYear = birthDate.getFullYear();
            const age = currentYear - birthYear;

            // Buat tanggal ulang tahun di tahun INI
            const currentYearBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
            // Perbaiki timezone issue
            const formattedDate = currentYearBday.toLocaleDateString('en-CA'); // YYYY-MM-DD format

            calendarEvents.push({
              id: `ultah-${member.id}`,
              title: `🎂 Ultah: ${member.nama_lengkap}`,
              start: formattedDate,
              allDay: true,
              backgroundColor: "#EBF5FF", // Biru Muda (Tailwind blue-100)
              borderColor: "#3B82F6", // Biru Tua (Tailwind blue-500)
              textColor: "#1D4ED8",
              extendedProps: {
                type: "Ulang Tahun",
                originalDate: member.tanggal_lahir,
                ageOrAnniversary: age,
                memberData: member,
              },
            });
          }

          // --- 2. PROSES DATA PERNIKAHAN ---
          // Hanya ambil data dari "Kepala Keluarga" agar event pernikahan tidak double 
          // (karena Istri juga punya tanggal perkawinan yang sama di database)
          if (
            member.hubungan_keluarga === "Kepala Keluarga" &&
            member.status_pernikahan === "Sudah Menikah" &&
            member.tanggal_perkawinan &&
            member.tanggal_perkawinan !== "0000-00-00"
          ) {
            const marriageDate = new Date(member.tanggal_perkawinan);
            const marriageYear = marriageDate.getFullYear();
            const anniversary = currentYear - marriageYear;

            // Buat tanggal anniversary di tahun INI
            const currentYearAnniv = new Date(currentYear, marriageDate.getMonth(), marriageDate.getDate());
            const formattedAnnivDate = currentYearAnniv.toLocaleDateString('en-CA');

            // Cari nama istrinya berdasarkan no_kk yang sama
            const wife = rawData.find(
              (w) => w.no_kk === member.no_kk && w.hubungan_keluarga === "Istri"
            );
            const partnerName = wife ? wife.nama_lengkap : "Istri";

            calendarEvents.push({
              id: `nikah-${member.id}`,
              title: `💍 Nikah: Kel. ${member.nama_lengkap}`,
              start: formattedAnnivDate,
              allDay: true,
              backgroundColor: "#DCFCE7", // Hijau Muda (Tailwind green-100)
              borderColor: "#22C55E", // Hijau Tua (Tailwind green-500)
              textColor: "#15803D",
              extendedProps: {
                type: "Pernikahan",
                originalDate: member.tanggal_perkawinan,
                ageOrAnniversary: anniversary,
                memberData: member,
                partnerName: partnerName,
              },
            });
          }
        });

        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error("Gagal memuat event:", error);
    }
  };

  // Saat Event di Kalender di klik
  const handleEventClick = (clickInfo: EventClickArg) => {
    // Cast type event yang diklik ke CalendarEvent kita
    const clickedEvent = {
      title: clickInfo.event.title,
      extendedProps: clickInfo.event.extendedProps as CalendarEvent["extendedProps"],
    } as CalendarEvent;

    setSelectedEvent(clickedEvent);
    openModal();
  };

  return (
    <>
      <PageMeta
        title="Kalender Jemaat | CMS GKII"
        description="Kalender Ulang Tahun dan Hari Jadi Pernikahan Jemaat"
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-boxdark shadow-sm">
        
        {/* Keterangan Warna (Legend) */}
        <div className="mb-4 flex gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded border border-blue-500 bg-blue-100 block"></span>
            Ulang Tahun
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded border border-green-500 bg-green-100 block"></span>
            Hari Jadi Pernikahan
          </div>
        </div>

        {/* Komponen Kalender */}
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            events={events}
            eventClick={handleEventClick}
            eventDisplay="block" // Supaya border color kelihatan utuh
            height={"auto"} // Agar menyesuaikan layar
            // Mencegah select & drag n drop karena ini view only
            editable={false} 
            selectable={false}
          />
        </div>

        {/* Modal Pop Up Info Event */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[450px] p-6 lg:p-8">
          {selectedEvent && (
            <div className="flex flex-col text-center">
              
              {/* Ikon Besar Berdasarkan Tipe */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 shadow-sm
                {selectedEvent.extendedProps.type === 'Ulang Tahun' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}">
                {selectedEvent.extendedProps.type === "Ulang Tahun" ? (
                  <span className="text-3xl">🎂</span>
                ) : (
                  <span className="text-3xl">💍</span>
                )}
              </div>

              {/* Judul Modal */}
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {selectedEvent.extendedProps.type === "Ulang Tahun" 
                  ? "Selamat Ulang Tahun!" 
                  : "Happy Anniversary!"}
              </h3>

              {/* Konten Spesifik */}
              <div className="mt-4 rounded-xl bg-gray-50 p-5 dark:bg-gray-800 text-left border border-gray-100 dark:border-gray-700">
                {selectedEvent.extendedProps.type === "Ulang Tahun" ? (
                  <>
                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Nama Jemaat</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedEvent.extendedProps.memberData.nama_lengkap}
                    </p>
                    
                    <div className="mt-4 h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className="mt-4 flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Lahir</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedEvent.extendedProps.originalDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Usia Tahun Ini</p>
                        <p className="font-bold text-blue-600 text-lg">
                          {selectedEvent.extendedProps.ageOrAnniversary} Tahun
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Keluarga</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Bpk. {selectedEvent.extendedProps.memberData.nama_lengkap}
                    </p>
                    <p className="text-md font-semibold text-gray-700 dark:text-gray-300">
                      & Ibu {selectedEvent.extendedProps.partnerName}
                    </p>

                    <div className="mt-4 h-px w-full bg-gray-200 dark:bg-gray-700"></div>

                    <div className="mt-4 flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Tgl Pemberkatan</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedEvent.extendedProps.originalDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Usia Pernikahan</p>
                        <p className="font-bold text-green-600 text-lg">
                          {selectedEvent.extendedProps.ageOrAnniversary} Tahun
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tombol Tutup */}
              <button
                onClick={closeModal}
                className="mt-8 w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Tutup Peringatan
              </button>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Calendar;