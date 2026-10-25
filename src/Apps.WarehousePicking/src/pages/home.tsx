import { useEffect, useMemo, useState } from "react"
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowLeftRegular,
  ArrowSwapRegular,
  BoxRegular,
  DismissRegular,
  LocationRegular,
  SearchRegular,
} from "@fluentui/react-icons"
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Radio,
  RadioGroup,
  Spinner,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title2,
} from "@fluentui/react-components"
import { Lab_warehouseitemsService } from "@/generated/services/Lab_warehouseitemsService"
import { Lab_warehouselocationsService } from "@/generated/services/Lab_warehouselocationsService"
import { Lab_warehousetransactionsService } from "@/generated/services/Lab_warehousetransactionsService"
import type { Lab_warehouseitems, Lab_warehouseitemsBase } from "@/generated/models/Lab_warehouseitemsModel"
import type { Lab_warehouselocationsBase, Lab_warehouselocations } from "@/generated/models/Lab_warehouselocationsModel"
import type {
  Lab_warehousetransactions,
  Lab_warehousetransactionsBase,
  Lab_warehousetransactionslab_transactiontype,
} from "@/generated/models/Lab_warehousetransactionsModel"
import { NumberFormField, TextFormField } from "@/components/FormFields"
import { WarehouseLookup, type LookupValue } from "@/components/WarehouseLookup"
import { useStyles } from "./home.styles"

type ViewName = "items" | "transactions" | "locations"
type TransactionType = Lab_warehousetransactionslab_transactiontype
type ItemCategory = NonNullable<Lab_warehouseitemsBase["lab_category"]>
type Styles = ReturnType<typeof useStyles>

const categoryLabels: Record<string, string> = {
  "100000000": "Electronics",
  "100000001": "Clothing",
  "100000002": "Food",
  "100000003": "Hardware",
  "100000004": "Other",
}

const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: 100000000, label: "Inbound" },
  { value: 100000001, label: "Outbound" },
]

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The operation failed"
}

function getCategoryLabel(category?: string | number): string {
  return category ? categoryLabels[String(category)] ?? "Other" : "Uncategorized"
}

function normalizeId(id?: string | null): string {
  return (id ?? "").replace(/[{}]/g, "").toLocaleLowerCase()
}

function formatQuantity(value?: string): string {
  const quantity = Number(value ?? 0)
  return Number.isFinite(quantity) ? new Intl.NumberFormat().format(quantity) : "0"
}

function formatDate(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default function HomePage() {
  const styles = useStyles()
  const [view, setView] = useState<ViewName>("items")
  const [items, setItems] = useState<Lab_warehouseitems[]>([])
  const [transactions, setTransactions] = useState<Lab_warehousetransactions[]>([])
  const [locations, setLocations] = useState<Lab_warehouselocations[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemSearch, setItemSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [transactionItem, setTransactionItem] = useState<Lab_warehouseitems | null>(null)

  useEffect(() => {
    let current = true
    setLoading(true)
    setLoadError(null)

    Promise.all([
      Lab_warehouseitemsService.getAll({ maxPageSize: 500 }),
      Lab_warehousetransactionsService.getAll({ maxPageSize: 500 }),
      Lab_warehouselocationsService.getAll({ maxPageSize: 500 }),
    ])
      .then(([itemResult, transactionResult, locationResult]) => {
        if (!current) return
        if (!itemResult.success) throw new Error(itemResult.error?.message ?? "The operation failed")
        if (!transactionResult.success) throw new Error(transactionResult.error?.message ?? "The operation failed")
        if (!locationResult.success) throw new Error(locationResult.error?.message ?? "The operation failed")

        setItems(itemResult.data ?? [])
        setTransactions(transactionResult.data ?? [])
        setLocations(locationResult.data ?? [])
      })
      .catch((error: unknown) => {
        if (current) setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [refreshKey])

  const selectedItem = items.find((item) => normalizeId(item.lab_warehouseitemid) === normalizeId(selectedItemId)) ?? null
  const visibleItems = useMemo(() => {
    const search = itemSearch.trim().toLocaleLowerCase()
    const sorted = [...items].sort((left, right) => left.lab_name.localeCompare(right.lab_name))
    if (!search) return sorted
    return sorted.filter((item) =>
      item.lab_name.toLocaleLowerCase().includes(search) ||
      item.lab_sku.toLocaleLowerCase().includes(search) ||
      getCategoryLabel(item.lab_category).toLocaleLowerCase().includes(search)
    )
  }, [itemSearch, items])
  const recentTransactions = useMemo(
    () => [...transactions].sort((left, right) => Date.parse(right.lab_transactiondate) - Date.parse(left.lab_transactiondate)),
    [transactions]
  )

  function refreshData() {
    setRefreshKey((key) => key + 1)
  }

  function openTransaction(item: Lab_warehouseitems | null = null) {
    setTransactionItem(item)
    setTransactionDialogOpen(true)
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark} aria-hidden="true">W</div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Warehouse Picking</span>
              <span className={styles.brandCaption}>Stock floor operations</span>
            </div>
          </div>
          <TabList
            selectedValue={view}
            onTabSelect={(_, data) => {
              setView(data.value as ViewName)
              setSelectedItemId(null)
              setNotice(null)
            }}
            aria-label="Warehouse sections"
          >
            <Tab value="items" icon={<BoxRegular />}>Items</Tab>
            <Tab value="transactions" icon={<ArrowSwapRegular />}>Transactions</Tab>
            <Tab value="locations" icon={<LocationRegular />}>Locations</Tab>
          </TabList>
        </div>
      </header>

      <main className={styles.main}>
        {loadError && (
          <MessageBar intent="error" className={styles.statusLine}>
            <MessageBarBody>{loadError}</MessageBarBody>
          </MessageBar>
        )}
        {notice && (
          <MessageBar intent="success" className={styles.statusLine}>
            <MessageBarBody>{notice}</MessageBarBody>
          </MessageBar>
        )}

        {loading ? (
          <div className={styles.empty}><Spinner label="Loading warehouse data" /></div>
        ) : view === "items" && selectedItem ? (
          <ItemDetails
            item={selectedItem}
            transactions={recentTransactions.filter((transaction) => normalizeId(transaction._lab_itemid_value) === normalizeId(selectedItem.lab_warehouseitemid))}
            styles={styles}
            onBack={() => setSelectedItemId(null)}
            onRecordTransaction={() => openTransaction(selectedItem)}
          />
        ) : view === "items" ? (
          <section>
            <PageHeader
              title="Items"
              description={`${items.length} stock item${items.length === 1 ? "" : "s"}`}
              action={(
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setItemDialogOpen(true)}>
                  Add item
                </Button>
              )}
              styles={styles}
            />
            <div className={styles.toolbar}>
              <Input
                className={styles.search}
                contentBefore={<SearchRegular />}
                value={itemSearch}
                onChange={(_, data) => setItemSearch(data.value)}
                placeholder="Search name, SKU or category"
                aria-label="Search warehouse items"
              />
              <Button appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={refreshData}>Refresh</Button>
            </div>
            <ItemsTable items={visibleItems} locations={locations} styles={styles} onSelect={setSelectedItemId} />
          </section>
        ) : view === "transactions" ? (
          <section>
            <PageHeader
              title="Transactions"
              description="Stock movements, newest first"
              action={(
                <Button appearance="primary" icon={<AddRegular />} onClick={() => openTransaction()}>
                  New transaction
                </Button>
              )}
              styles={styles}
            />
            <TransactionsTable transactions={recentTransactions} styles={styles} onSelectItem={(id) => {
              setView("items")
              setSelectedItemId(id)
            }} />
          </section>
        ) : (
          <section>
            <PageHeader
              title="Locations"
              description={`${locations.length} warehouse location${locations.length === 1 ? "" : "s"}`}
              action={(
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setLocationDialogOpen(true)}>
                  Add location
                </Button>
              )}
              styles={styles}
            />
            <LocationsTable locations={locations} items={items} styles={styles} />
          </section>
        )}
      </main>

      <ItemDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        onCreated={() => {
          setItemDialogOpen(false)
          setNotice("Item added.")
          refreshData()
        }}
      />
      <LocationDialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        onCreated={() => {
          setLocationDialogOpen(false)
          setNotice("Location added.")
          refreshData()
        }}
      />
      <TransactionDialog
        open={transactionDialogOpen}
        initialItem={transactionItem}
        onClose={() => setTransactionDialogOpen(false)}
        onCreated={() => {
          setTransactionDialogOpen(false)
          setNotice("Transaction saved.")
          refreshData()
        }}
      />
    </div>
  )
}

function PageHeader({ title, description, action, styles }: { title: string; description: string; action: React.ReactNode; styles: Styles }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <Text className={styles.pageDescription}>{description}</Text>
      </div>
      {action}
    </div>
  )
}

function ItemsTable({ items, locations, styles, onSelect }: { items: Lab_warehouseitems[]; locations: Lab_warehouselocations[]; styles: Styles; onSelect: (id: string) => void }) {
  const locationNames = new Map(locations.map((location) => [normalizeId(location.lab_warehouselocationid), location.lab_name]))
  if (items.length === 0) return <EmptyState styles={styles} text="No items found." />

  return (
    <div className={styles.tableWrap}>
      <Table aria-label="Warehouse items" className={styles.table} size="small">
        <TableHeader><TableRow><TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>SKU</TableHeaderCell><TableHeaderCell>On hand</TableHeaderCell><TableHeaderCell>Category</TableHeaderCell><TableHeaderCell>Location</TableHeaderCell></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.lab_warehouseitemid}>
              <TableCell><Button appearance="subtle" className={styles.clickableName} onClick={() => onSelect(item.lab_warehouseitemid)}>{item.lab_name}</Button></TableCell>
              <TableCell>{item.lab_sku}</TableCell>
              <TableCell>{formatQuantity(item.lab_availablequantity)}</TableCell>
              <TableCell>{getCategoryLabel(item.lab_category)}</TableCell>
              <TableCell>{locationNames.get(normalizeId(item._lab_locationid_value)) ?? item.lab_locationidname ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ItemDetails({ item, transactions, styles, onBack, onRecordTransaction }: { item: Lab_warehouseitems; transactions: Lab_warehousetransactions[]; styles: Styles; onBack: () => void; onRecordTransaction: () => void }) {
  return (
    <section>
      <div className={styles.detailHeader}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={onBack}>Items</Button>
        <div><h1 className={styles.pageTitle}>{item.lab_name}</h1><Text className={styles.pageDescription}>{item.lab_sku}</Text></div>
      </div>
      <div className={styles.detailGrid}>
        <DetailCell label="On hand" value={formatQuantity(item.lab_availablequantity)} styles={styles} />
        <DetailCell label="Category" value={getCategoryLabel(item.lab_category)} styles={styles} />
        <DetailCell label="Location" value={item.lab_locationidname ?? "Unassigned"} styles={styles} />
      </div>
      {item.lab_description && <Text>{item.lab_description}</Text>}
      <div className={styles.sectionHeading}>
        <Title2>Recent transactions</Title2>
        <Button appearance="primary" icon={<AddRegular />} onClick={onRecordTransaction}>Record transaction</Button>
      </div>
      <TransactionsTable transactions={transactions} styles={styles} onSelectItem={() => undefined} />
    </section>
  )
}

function DetailCell({ label, value, styles }: { label: string; value: string; styles: Styles }) {
  return <div className={styles.detailCell}><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>
}

function TransactionsTable({ transactions, styles, onSelectItem }: { transactions: Lab_warehousetransactions[]; styles: Styles; onSelectItem: (id: string) => void }) {
  if (transactions.length === 0) return <EmptyState styles={styles} text="No transactions recorded." />
  return (
    <div className={styles.tableWrap}>
      <Table aria-label="Warehouse transactions" className={styles.table} size="small">
        <TableHeader><TableRow><TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Transaction</TableHeaderCell><TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>Quantity</TableHeaderCell><TableHeaderCell>Reference</TableHeaderCell></TableRow></TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.lab_warehousetransactionid}>
              <TableCell>{formatDate(transaction.lab_transactiondate)}</TableCell>
              <TableCell>{transaction.lab_transactiontypename ?? transactionTypes.find((type) => type.value === transaction.lab_transactiontype)?.label ?? "—"}</TableCell>
              <TableCell>{transaction._lab_itemid_value ? <Button appearance="subtle" className={styles.clickableName} onClick={() => onSelectItem(transaction._lab_itemid_value!)}>{transaction.lab_itemidname ?? "View item"}</Button> : transaction.lab_itemidname ?? "—"}</TableCell>
              <TableCell>{formatQuantity(transaction.lab_quantity)}</TableCell>
              <TableCell>{transaction.lab_referencenumber ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LocationsTable({ locations, items, styles }: { locations: Lab_warehouselocations[]; items: Lab_warehouseitems[]; styles: Styles }) {
  if (locations.length === 0) return <EmptyState styles={styles} text="No locations found." />
  const itemCounts = new Map<string, number>()
  for (const item of items) {
    const locationId = normalizeId(item._lab_locationid_value)
    if (locationId) itemCounts.set(locationId, (itemCounts.get(locationId) ?? 0) + 1)
  }

  return (
    <div className={styles.tableWrap}>
      <Table aria-label="Warehouse locations" className={styles.table} size="small">
        <TableHeader><TableRow><TableHeaderCell>Location</TableHeaderCell><TableHeaderCell>Address</TableHeaderCell><TableHeaderCell>Capacity</TableHeaderCell><TableHeaderCell>Items held</TableHeaderCell></TableRow></TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.lab_warehouselocationid}>
              <TableCell>{location.lab_name}</TableCell><TableCell>{location.lab_address ?? "—"}</TableCell><TableCell>{location.lab_capacity ? formatQuantity(location.lab_capacity) : "—"}</TableCell><TableCell>{itemCounts.get(normalizeId(location.lab_warehouselocationid)) ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EmptyState({ styles, text }: { styles: Styles; text: string }) {
  return <div className={styles.empty}>{text}</div>
}

function ItemDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const styles = useStyles()
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [quantity, setQuantity] = useState<number | null>(null)
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState<LookupValue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    setError(null)
    if (!name.trim() || !sku.trim() || quantity === null) {
      setError("Fill all required fields.")
      return
    }
    const record = {
      lab_name: name.trim(),
      lab_sku: sku.trim(),
      lab_availablequantity: String(quantity),
      ...(category ? { lab_category: Number(category) as ItemCategory } : {}),
      ...(location ? { "lab_locationid@odata.bind": `/lab_warehouselocations(${normalizeId(location.id)})` } : {}),
    } as unknown as Omit<Lab_warehouseitemsBase, "lab_warehouseitemid">

    setSaving(true)
    try {
      const result = await Lab_warehouseitemsService.create(record)
      if (!result.success) {
        setError(result.error?.message ?? "The operation failed")
        return
      }
      onCreated()
      setName("")
      setSku("")
      setQuantity(null)
      setCategory("")
      setLocation(null)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} aria-label="Close" onClick={onClose} />}>Add item</DialogTitle>
          <DialogContent>
            <div className={styles.formGrid}>
              <TextFormField label="Name" value={name} onChange={setName} required />
              <TextFormField label="SKU" value={sku} onChange={setSku} required />
              <NumberFormField label="Available quantity" value={quantity} onChange={setQuantity} required />
              <Field label="Category">
                <Dropdown value={category ? getCategoryLabel(Number(category)) : ""} selectedOptions={category ? [category] : []} onOptionSelect={(_, data) => setCategory(data.optionValue ?? "")} placeholder="Choose a category">
                  {Object.entries(categoryLabels).map(([value, label]) => <Option key={value} value={value}>{label}</Option>)}
                </Dropdown>
              </Field>
              <WarehouseLookup entity="location" label="Location (optional)" value={location} onChange={setLocation} onError={setError} />
            </div>
            {error && <MessageBar intent="error" className={styles.statusLine}><MessageBarBody>{error}</MessageBarBody></MessageBar>}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={saving} onClick={submit}>{saving ? "Saving…" : "Add item"}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

function LocationDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const styles = useStyles()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [capacity, setCapacity] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    setError(null)
    if (!name.trim()) {
      setError("Fill all required fields.")
      return
    }
    const record = {
      lab_name: name.trim(),
      ...(address.trim() ? { lab_address: address.trim() } : {}),
      ...(capacity !== null ? { lab_capacity: String(capacity) } : {}),
    } as unknown as Omit<Lab_warehouselocationsBase, "lab_warehouselocationid">

    setSaving(true)
    try {
      const result = await Lab_warehouselocationsService.create(record)
      if (!result.success) {
        setError(result.error?.message ?? "The operation failed")
        return
      }
      onCreated()
      setName("")
      setAddress("")
      setCapacity(null)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} aria-label="Close" onClick={onClose} />}>Add location</DialogTitle>
          <DialogContent>
            <div className={styles.formGrid}>
              <TextFormField label="Name" value={name} onChange={setName} required />
              <TextFormField label="Address" value={address} onChange={setAddress} />
              <NumberFormField label="Capacity" value={capacity} onChange={setCapacity} />
            </div>
            {error && <MessageBar intent="error" className={styles.statusLine}><MessageBarBody>{error}</MessageBarBody></MessageBar>}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={saving} onClick={submit}>{saving ? "Saving…" : "Add location"}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

function TransactionDialog({ open, initialItem, onClose, onCreated }: { open: boolean; initialItem: Lab_warehouseitems | null; onClose: () => void; onCreated: () => void }) {
  const styles = useStyles()
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState<number | null>(null)
  const [type, setType] = useState<TransactionType | "">("")
  const [itemLookup, setItemLookup] = useState<LookupValue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const selectedItem = initialItem
    ? { id: initialItem.lab_warehouseitemid, name: initialItem.lab_name, entityType: "lab_warehouseitem" }
    : itemLookup

  useEffect(() => {
    if (open) {
      setName("")
      setQuantity(null)
      setType("")
      setItemLookup(null)
      setError(null)
    }
  }, [open, initialItem])

  async function submit() {
    setError(null)
    if (!name.trim() || quantity === null || !type || !selectedItem) {
      setError("Fill all required fields.")
      return
    }
    const record = {
      lab_name: name.trim(),
      lab_quantity: String(quantity),
      lab_transactiontype: type,
      lab_transactiondate: new Date().toISOString(),
      "lab_itemid@odata.bind": `/lab_warehouseitems(${normalizeId(selectedItem.id)})`,
    } as unknown as Omit<Lab_warehousetransactionsBase, "lab_warehousetransactionid">

    setSaving(true)
    try {
      const result = await Lab_warehousetransactionsService.create(record)
      if (!result.success) {
        setError(result.error?.message ?? "The operation failed")
        return
      }
      onCreated()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} aria-label="Close" onClick={onClose} />}>New transaction</DialogTitle>
          <DialogContent>
            <div className={styles.formGrid}>
              <TextFormField label="Name" value={name} onChange={setName} required />
              <NumberFormField label="Quantity" value={quantity} onChange={setQuantity} required />
              <Field label="Type" required>
                <RadioGroup value={type ? String(type) : ""} onChange={(_, data) => setType(data.value ? Number(data.value) as TransactionType : "")} layout="horizontal">
                  {transactionTypes.map((transactionType) => <Radio key={transactionType.value} value={String(transactionType.value)} label={transactionType.label} />)}
                </RadioGroup>
              </Field>
              {initialItem ? (
                <Field label="Item" required><Text>{initialItem.lab_name} · {initialItem.lab_sku}</Text></Field>
              ) : (
                <WarehouseLookup entity="item" label="Item" value={itemLookup} onChange={setItemLookup} required onError={setError} />
              )}
            </div>
            {error && <MessageBar intent="error" className={styles.statusLine}><MessageBarBody>{error}</MessageBarBody></MessageBar>}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={saving} onClick={submit}>{saving ? "Saving…" : "Save transaction"}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
