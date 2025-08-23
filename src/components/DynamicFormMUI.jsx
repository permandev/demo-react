import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { builderToSpecs, specsToZod } from './generator'

// MUI
import {
  Box, Stack, Typography, TextField, FormControl, FormLabel, RadioGroup,
  Radio, FormControlLabel, Checkbox, Select, MenuItem, Chip, Alert, Button,
  FormHelperText, Divider, Card, CardContent
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'

export default function DynamicFormMUI({ builderJson, onSubmit }) {
  const specs = useMemo(() => builderToSpecs(builderJson), [builderJson])
  const { schema, defaultValues } = useMemo(() => specsToZod(specs), [specs])

  const {
    handleSubmit, control, formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched'
  })

  return (
    <Card elevation={2}>
      <CardContent>
        <form onSubmit={handleSubmit(data => onSubmit?.(data))}>
          <Stack spacing={2}>
            {specs.map((s, idx) => {
              if (s.kind === 'static') {
                if (s.renderer === 'header') {
                  return (
                    <Typography key={idx} variant="h5" fontWeight={700}>
                      {s.content || ''}
                    </Typography>
                  )
                }
                if (s.renderer === 'paragraph') {
                  return (
                    <Typography key={idx} variant="body1">
                      {s.content || ''}
                    </Typography>
                  )
                }
                if (s.renderer === 'line') return <Divider key={idx} />
                return null
              }

              const err = errors?.[s.name]?.message

              if (s.kind === 'text' || s.kind === 'textarea' || s.kind === 'number') {
                const isNumber = s.kind === 'number'
                const multiline = s.kind === 'textarea'
                return (
                  <Controller
                    key={s.name}
                    control={control}
                    name={s.name}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`${s.label}${s.required ? ' *' : ''}`}
                        fullWidth
                        type={isNumber ? 'number' : 'text'}
                        multiline={multiline}
                        minRows={multiline ? 3 : undefined}
                        error={!!err}
                        helperText={err}
                        inputProps={{
                          ...(isNumber && s.min !== undefined ? { min: s.min } : {}),
                          ...(isNumber && s.max !== undefined ? { max: s.max } : {}),
                        }}
                      />
                    )}
                  />
                )
              }

              if (s.kind === 'radio') {
                return (
                  <FormControl key={s.name} error={!!err}>
                    <FormLabel>{s.label}{s.required ? ' *' : ''}</FormLabel>
                    {s.options.length === 0 ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>ยังไม่มีตัวเลือกในเทมเพลต</Alert>
                    ) : (
                      <Controller
                        control={control}
                        name={s.name}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          >
                            {s.options.map(opt => (
                              <FormControlLabel
                                key={opt.value}
                                value={opt.value}
                                control={<Radio />}
                                label={opt.label}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                    )}
                    {err && <FormHelperText>{err}</FormHelperText>}
                  </FormControl>
                )
              }

              if (s.kind === 'select') {
                const multiple = !!s.multiple
                return (
                  <FormControl key={s.name} fullWidth error={!!err}>
                    <FormLabel>{s.label}{s.required ? ' *' : ''}</FormLabel>
                    {s.options.length === 0 ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>ยังไม่มีตัวเลือกในเทมเพลต</Alert>
                    ) : (
                      <Controller
                        control={control}
                        name={s.name}
                        render={({ field }) => (
                          <Select
                            multiple={multiple}
                            value={field.value ?? (multiple ? [] : '')}
                            onChange={(e) => field.onChange(e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                              if (!multiple) {
                                const val = selected
                                if (!val) return <Typography color="text.secondary">— เลือก —</Typography>
                                const label = s.options.find(o => o.value === val)?.label ?? val
                                return label
                              }
                              const arr = selected || []
                              if (!arr.length) return <Typography color="text.secondary">— เลือก —</Typography>
                              return (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {arr.map(v => {
                                    const label = s.options.find(o => o.value === v)?.label ?? v
                                    return <Chip key={v} size="small" label={label} />
                                  })}
                                </Box>
                              )
                            }}
                          >
                            {!multiple && <MenuItem value=""><em>— เลือก —</em></MenuItem>}
                            {s.options.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                    {err && <FormHelperText>{err}</FormHelperText>}
                  </FormControl>
                )
              }

              if (s.kind === 'checkboxes') {
                return (
                  <FormControl key={s.name} error={!!err}>
                    <FormLabel>{s.label}{s.required ? ' *' : ''}</FormLabel>
                    {s.options.length === 0 ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>ยังไม่มีตัวเลือกในเทมเพลต</Alert>
                    ) : (
                      <Controller
                        control={control}
                        name={s.name}
                        render={({ field }) => {
                          const valueSet = new Set(Array.isArray(field.value) ? field.value : [])
                          return (
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              {s.options.map(opt => {
                                const checked = valueSet.has(opt.value)
                                return (
                                  <FormControlLabel
                                    key={opt.value}
                                    control={
                                      <Checkbox
                                        checked={checked}
                                        onChange={(e) => {
                                          const next = new Set(valueSet)
                                          if (e.target.checked) next.add(opt.value)
                                          else next.delete(opt.value)
                                          field.onChange(Array.from(next))
                                        }}
                                      />
                                    }
                                    label={opt.label}
                                  />
                                )
                              })}
                            </Stack>
                          )
                        }}
                      />
                    )}
                    {err && <FormHelperText>{err}</FormHelperText>}
                  </FormControl>
                )
              }

              if (s.kind === 'date') {
                return (
                  <Controller
                    key={s.name}
                    control={control}
                    name={s.name}
                    render={({ field }) => (
                      <DatePicker
                        label={`${s.label}${s.required ? ' *' : ''}`}
                        value={field.value ? new Date(field.value) : null}
                        onChange={(val) => field.onChange(val ?? '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!err,
                            helperText: err
                          }
                        }}
                      />
                    )}
                  />
                )
              }

              return null
            })}

            <Box>
              <Button type="submit" variant="contained">บันทึก</Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
