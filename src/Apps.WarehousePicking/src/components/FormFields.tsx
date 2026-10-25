import { Field } from "@fluentui/react-components"
import { Decimal, TextField, usePcfContext } from "@talxis/base-controls"

type TextFormFieldProps = {
  label: string
  value: string
  required?: boolean
  onChange: (value: string) => void
}

export function TextFormField({ label, value, required = false, onChange }: TextFormFieldProps) {
  const context = usePcfContext()

  return (
    <Field label={label} required={required}>
      <TextField
        context={context}
        parameters={{ value: { raw: value, type: "SingleLine.Text" } }}
        onNotifyOutputChanged={(outputs) => onChange(outputs.value ?? "")}
      />
    </Field>
  )
}

type NumberFormFieldProps = {
  label: string
  value: number | null
  required?: boolean
  onChange: (value: number | null) => void
}

export function NumberFormField({ label, value, required = false, onChange }: NumberFormFieldProps) {
  const context = usePcfContext()

  return (
    <Field label={label} required={required}>
      <Decimal
        context={context}
        parameters={{ value: { raw: value, type: "Whole.None" } }}
        onNotifyOutputChanged={(outputs) => onChange(outputs.value ?? null)}
      />
    </Field>
  )
}