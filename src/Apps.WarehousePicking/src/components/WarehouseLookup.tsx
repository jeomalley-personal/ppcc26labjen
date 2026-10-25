import { Field } from "@fluentui/react-components"
import { Lookup, usePcfContext, type ILookupProperty } from "@talxis/base-controls"
import { Lab_warehouseitemsService } from "@/generated/services/Lab_warehouseitemsService"
import { Lab_warehouselocationsService } from "@/generated/services/Lab_warehouselocationsService"

export type LookupValue = ComponentFramework.LookupValue
export type LookupEntity = "item" | "location"

type WarehouseLookupProps = {
  entity: LookupEntity
  label: string
  value: LookupValue | null
  required?: boolean
  onChange: (value: LookupValue | null) => void
  onError?: (message: string) => void
}

const entityNames: Record<LookupEntity, string> = {
  item: "lab_warehouseitem",
  location: "lab_warehouselocation",
}

export function WarehouseLookup({
  entity,
  label,
  value,
  required = false,
  onChange,
  onError,
}: WarehouseLookupProps) {
  const context = usePcfContext()
  const entityLogicalName = entityNames[entity]
  const lookupProperty: ILookupProperty = {
    raw: value ? [value] : [],
    attributes: { Targets: [entityLogicalName] },
    getAllViews: async () => [],
  }

  async function search(query: string): Promise<LookupValue[]> {
    if (entity === "item") {
      const result = await Lab_warehouseitemsService.getAll({ top: 100 })
      if (!result.success) {
        onError?.(result.error?.message ?? "The operation failed")
        return []
      }

      const normalizedQuery = query.trim().toLocaleLowerCase()
      return (result.data ?? [])
        .filter((item) =>
          !normalizedQuery ||
          item.lab_name.toLocaleLowerCase().includes(normalizedQuery) ||
          item.lab_sku.toLocaleLowerCase().includes(normalizedQuery)
        )
        .slice(0, 50)
        .map((item) => ({
          id: item.lab_warehouseitemid,
          name: item.lab_name,
          entityType: entityLogicalName,
        }))
    }

    const result = await Lab_warehouselocationsService.getAll({ top: 100 })
    if (!result.success) {
      onError?.(result.error?.message ?? "The operation failed")
      return []
    }

    const normalizedQuery = query.trim().toLocaleLowerCase()
    return (result.data ?? [])
      .filter((location) =>
        !normalizedQuery ||
        location.lab_name.toLocaleLowerCase().includes(normalizedQuery) ||
        (location.lab_address ?? "").toLocaleLowerCase().includes(normalizedQuery)
      )
      .slice(0, 50)
      .map((location) => ({
        id: location.lab_warehouselocationid,
        name: location.lab_name,
        entityType: entityLogicalName,
      }))
  }

  return (
    <Field label={label} required={required}>
      <Lookup
        context={context}
        parameters={{
          value: lookupProperty,
          MultipleEnabled: { raw: false },
          IsInlineNewEnabled: { raw: false },
          EnableNavigation: { raw: false },
        }}
        onSearch={(_entityNames, query) => search(query)}
        onNotifyOutputChanged={(outputs) => onChange(outputs.value?.[0] ?? null)}
      />
    </Field>
  )
}