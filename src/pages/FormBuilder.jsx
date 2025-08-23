import { useState, useEffect } from 'react';
import { ReactFormBuilder } from 'react-form-builder2';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-form-builder2/dist/app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function FormBuilder() {

  const [formData, setFormData] = useState([]);

   useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:3000/forms/3', {
        // headers: { Authorization: 'Bearer ...' },
      });
      const payload = await res.json();

      // normalize ให้เป็น array ตรง ๆ
      const items = Array.isArray(payload)
        ? payload
        : payload?.task_data ?? payload?.data ?? [];

      setFormData(items);
    })();
  }, []);
// ยังโหลดอยู่ → ยังไม่ render Builder
  if (!formData) return null;

  // ใช้ key บังคับให้ remount ถ้า data เปลี่ยน
  const keyByIds = formData.map(i => i.id).join('|');

  return (
    <div>
      <h1>Form Builder</h1>
      <p>This is a placeholder for the Form Builder component.</p>
      <ReactFormBuilder
        key={keyByIds}
        edit
        data={formData}
        onPost={(data) =>
          fetch('http://localhost:3000/forms/3', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' /*, Authorization: 'Bearer ...'*/ },
            body: JSON.stringify(data),
          })
        }
      />
    </div>
  );
}