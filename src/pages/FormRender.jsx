import React, { useState, useEffect } from 'react';
import DynamicFormMUI from '../components/DynamicFormMUI'
export default function FormRender() {

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

  const handleSubmit = (data) => {
    console.log('Form data:', data)
    alert('บันทึกสำเร็จ\n' + JSON.stringify(data, null, 2))
  }

  return (
    <div>
      <h1>Form Render</h1>
      <p>This is a placeholder for the Form Render component.</p>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <DynamicFormMUI builderJson={formData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}