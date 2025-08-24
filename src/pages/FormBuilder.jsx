import { useState, useEffect } from 'react';
import { ReactFormBuilder } from 'react-form-builder2';
import { USE_LOCAL_DATA, fetchFrom, updateForm } from '../helper/form.util.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-form-builder2/dist/app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function FormBuilder() {

  const [formData, setFormData] = useState([]);
  //const [keyByIds, setKeyByIds] = useState("");

  useEffect(() => {
    (async () => {
      let data = await fetchFrom(3, USE_LOCAL_DATA);
      setFormData(data);
    })();
  }, []);

  if (!formData) return null;
  const keyByIds = formData.map(i => i.id).join('|');

  console.log('test');

  return (
    <div>
      <h1>Form Builder</h1>
      <p>This is a placeholder for the Form Builder component.</p>
      <ReactFormBuilder
        key={keyByIds}
        edit
        data={formData}
        onPost={async (data) =>
          await updateForm(3, data, USE_LOCAL_DATA)
        }
      />
    </div>
  );
}