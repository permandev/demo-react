import React, { useState, useEffect } from 'react';
import { Container, Paper, Stack, TextField, Button, Typography } from '@mui/material';
import { z } from 'zod';

const schema = z.object({
  text1: z.string().trim().min(1, 'ต้องกรอก Text1'),
  text2: z.string().optional().default(''),
});


export default  function Test() {
  const [values, setValues] = useState({ text1: '', text2: '' });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse(values);
    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setErrors({ text1: f.text1?.[0] });
      return;
    }
    alert(JSON.stringify(result.data, null, 2));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>ทดสอบ MUI + Zod</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Text 1 (required)"
              name="text1"
              value={values.text1}
              onChange={onChange}
              error={Boolean(errors.text1)}
              helperText={errors.text1 || ' '}
              required
            />
            <TextField
              label="Text 2 (optional)"
              name="text2"
              value={values.text2}
              onChange={onChange}
            />
            <Button type="submit" variant="contained">Submit</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}