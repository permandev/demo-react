// src/form/generator.js
import { z } from "zod";

/**
 * แปลง JSON จาก react-form-builder2 → สเปกกลาง (FieldSpec แบบไม่ใช้ TypeScript)
 * รองรับชนิด: text, textarea, number, radio, select(single/multiple), checkboxes, date, และ static(header/paragraph/line)
 */
export function builderToSpecs(builderJson) {
  //const items = builderJson?.task_data ?? [];
  const items = builderJson ?? [];
  const specs = [];

  for (const it of items) {
    const element = (it.element || "").toLowerCase();

    // Static
    if (element === "header") {
      specs.push({ kind: "static", renderer: "header", content: it.content || it.text || "" });
      continue;
    }
    if (element === "paragraph") {
      specs.push({ kind: "static", renderer: "paragraph", content: it.content || it.text || "" });
      continue;
    }
    if (element === "linebreak") {
      specs.push({ kind: "static", renderer: "line" });
      continue;
    }

    // Field name
    const name =
      it.field_name ||
      it.id ||
      `${element}_${Math.random().toString(36).slice(2, 8)}`;

    const label = it.label || it.text || name;
    const required = !!it.required;

    switch (element) {
      case "textinput": {
        specs.push({ kind: "text", name, label, required });
        break;
      }
      case "textareainput":
      case "textarea": {
        specs.push({ kind: "textarea", name, label, required });
        break;
      }
      case "numberinput":
      case "number": {
        const min = typeof it.min_value === "number" ? it.min_value : undefined;
        const max = typeof it.max_value === "number" ? it.max_value : undefined;
        specs.push({ kind: "number", name, label, required, min, max });
        break;
      }
      case "radiobuttons": {
        const options = (it.options || []).map((o, idx) => ({
          label: o?.text ?? o?.label ?? `ตัวเลือก ${idx + 1}`,
          value: String(o?.value ?? o?.key ?? o?.text ?? idx),
        }));
        specs.push({ kind: "radio", name, label, required, options });
        break;
      }
      case "dropdown": {
        const options = (it.options || []).map((o, idx) => ({
          label: o?.text ?? o?.label ?? `ตัวเลือก ${idx + 1}`,
          value: String(o?.value ?? o?.key ?? o?.text ?? idx),
        }));
        specs.push({ kind: "select", name, label, required, options, multiple: !!it.multiple });
        break;
      }
      case "checkboxes": {
        const options = (it.options || []).map((o, idx) => ({
          label: o?.text ?? o?.label ?? `ตัวเลือก ${idx + 1}`,
          value: String(o?.value ?? o?.key ?? o?.text ?? idx),
        }));
        specs.push({ kind: "checkboxes", name, label, required, options });
        break;
      }
      case "datepicker":
      case "date": {
        specs.push({ kind: "date", name, label, required });
        break;
      }
      default: {
        // ชนิดที่ไม่รู้จัก – ข้ามไปแบบเงียบ ๆ หรือจะ push เป็น static ก็ได้
        // console.warn("Unknown element:", it);
        break;
      }
    }
  }

  return specs;
}

/**
 * แปลง FieldSpec → zod schema + defaultValues
 * ใช้คู่กับ react-hook-form ผ่าน zodResolver
 */
export function specsToZod(specs) {
  const shape = {};
  const defaults = {};

  for (const s of specs) {
    if (s.kind === "static") continue;

    switch (s.kind) {
      case "text": {
        let schema = z.string();
        if (s.required) schema = schema.min(1, `${s.label} ห้ามเว้นว่าง`);
        else schema = schema.optional().default('')
        shape[s.name] = schema;
        defaults[s.name] = "";
        break;
      }
      case "textarea": {
        let schema = z.string();
        if (s.required) schema = schema.min(1, `${s.label} ห้ามเว้นว่าง`);
        else schema = schema.optional().default('')
        shape[s.name] = schema;
        defaults[s.name] = "";
        break;
      }
      case "number": {
        let schema = z.coerce.number({ invalid_type_error: `${s.label} ต้องเป็นตัวเลข` });
        if (s.required) {
          schema = schema.refine(
            (v) => v !== undefined && !Number.isNaN(v),
            `${s.label} ห้ามเว้นว่าง`
          );
        }
        if (typeof s.min === "number") schema = schema.min(s.min, `${s.label} ต้อง ≥ ${s.min}`);
        if (typeof s.max === "number") schema = schema.max(s.max, `${s.label} ต้อง ≤ ${s.max}`);
        shape[s.name] = schema;
        defaults[s.name] = "";
        break;
      }
      case "radio": {
        const values = (s.options || []).map((o) => o.value);
        let schema = z.string();
        if (values.length > 0) schema = z.enum(values);
        if (!s.required) schema = schema.optional().or(z.literal(""));
        shape[s.name] = schema;
        defaults[s.name] = "";
        break;
      }
      case "select": {
        const values = (s.options || []).map((o) => o.value);
        if (s.multiple) {
          let schema =
            values.length > 0 ? z.array(z.enum(values)) : z.array(z.string());
          if (s.required) schema = schema.min(1, `กรุณาเลือกอย่างน้อย 1 ตัวเลือก`);
          shape[s.name] = schema;
          defaults[s.name] = [];
        } else {
          let schema = values.length > 0 ? z.enum(values) : z.string();
          if (!s.required) schema = schema.optional().or(z.literal(""));
          shape[s.name] = schema;
          defaults[s.name] = "";
        }
        break;
      }
      case "checkboxes": {
        const values = (s.options || []).map((o) => o.value);
        let schema =
          values.length > 0 ? z.array(z.enum(values)) : z.array(z.string());
        if (s.required) schema = schema.min(1, `กรุณาเลือกอย่างน้อย 1 ตัวเลือก`);
        shape[s.name] = schema;
        defaults[s.name] = [];
        break;
      }
      case "date": {
        let schema = z.coerce.date({ invalid_type_error: `${s.label} รูปแบบวันที่ไม่ถูกต้อง` });
        // ถ้าไม่ required อนุญาตให้ส่งค่าว่าง แล้ว map กลับเป็น undefined
        schema = s.required
          ? schema
          : z.union([schema, z.string().length(0)]).transform((v) =>
              v instanceof Date ? v : undefined
            );
        shape[s.name] = schema;
        defaults[s.name] = "";
        break;
      }
      default:
        break;
    }
  }

  return { schema: z.object(shape), defaultValues: defaults };
}
