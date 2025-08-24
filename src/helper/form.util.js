const USE_LOCAL_DATA = true; // --- เปลี่ยนเป็น false เพื่อใช้ API ---

export { USE_LOCAL_DATA };

export async function fetchFrom(id, useLocal = false) {

    if (useLocal) {
        const raw = localStorage.getItem(`form-${id}`);
        //console.log('fetchFrom localStorage', raw);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed)
                ? parsed
                : parsed?.task_data ?? parsed?.data ?? [];
        } catch {
            return [];
        }
    } else {
        const res = await fetch(`http://localhost:3000/forms/${id}`, {
        // headers: { Authorization: 'Bearer ...' },
        });
        const payload = await res.json();

        return Array.isArray(payload)
            ? payload
            : payload?.task_data ?? payload?.data ?? [];
    }
}

export async function updateForm(id, data, useLocal = false) {
    // --- ถ้าเลือกเก็บ localStorage ---
    if (useLocal) {
        localStorage.setItem(`form-${id}`, JSON.stringify(data.task_data));
        return data;
    }

    // --- ถ้าเลือกเก็บ API ---
    const res = await fetch(`http://localhost:3000/forms/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Authorization: 'Bearer ...',
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}