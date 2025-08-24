import { useState, useEffect } from 'react';
import DynamicFormMUI from '../components/DynamicFormMUI'
import { USE_LOCAL_DATA, fetchFrom } from '../helper/form.util.js';


export default function FormRender() {

  const [formData, setFormData] = useState([]);
  
  useEffect(() => {
      (async () => {
        let data = await fetchFrom(3, USE_LOCAL_DATA);
        //console.log('fetched form data', data);
        setFormData(data);
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