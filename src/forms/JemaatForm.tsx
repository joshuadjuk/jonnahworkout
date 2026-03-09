import React from 'react';

export default function JemaatForm(){
  return (
    <form className="space-y-3">
      <input placeholder="Nama" className="border p-2 w-full" />
      <input placeholder="Telepon" className="border p-2 w-full" />
      <textarea placeholder="Alamat" className="border p-2 w-full" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
    </form>
  );
}
