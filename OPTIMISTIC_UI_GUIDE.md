# Optimistic UI Implementation Guide

This guide shows you how to make your app feel **instant** like Notion or Linear using the optimistic UI hooks we've built.

## Quick Start: Making Fields Feel Instant

### Example 1: Financial Fields (Rent, Deposit, etc.)

**Before (slow, shows loading):**
```tsx
// User types → waits for server → sees update ❌
const [rent, setRent] = useState(application.rent)
const [isSaving, setIsSaving] = useState(false)

const handleSave = async (newRent: string) => {
  setIsSaving(true)
  await fetch('/api/applications/123', {
    method: 'PUT',
    body: JSON.stringify({ rent: newRent })
  })
  setIsSaving(false)
  setRent(newRent)
}
```

**After (instant!):**
```tsx
// User types → sees update immediately → server syncs in background ✅
import { useOptimisticApplicationField } from '@/hooks/useOptimisticApplicationField'
import ErrorModal from '@/components/ErrorModal'

const { value: rent, update: updateRent, error } = useOptimisticApplicationField({
  applicationId: 123,
  fieldName: 'rent',
  initialValue: application.rent || '',
  debounceMs: 500, // Waits 500ms after user stops typing
})

// Show error modal if save fails
const [showErrorModal, setShowErrorModal] = useState(false)

useEffect(() => {
  if (error) setShowErrorModal(true)
}, [error])

// In JSX:
<InlineTextField
  value={rent}
  onChange={updateRent} // That's it! Auto-saves with debouncing
/>

<ErrorModal
  isOpen={showErrorModal}
  title="Failed to Save"
  message={error?.message || 'Could not save changes'}
  onRetry={() => {
    updateRent(rent) // Retry the save
    setShowErrorModal(false)
  }}
  onCancel={() => {
    setShowErrorModal(false)
    // Value automatically reverts to last saved state
  }}
/>
```

### Example 2: Status Changes (Instant Badge Updates)

**Before:**
```tsx
const handleStatusChange = async (newStatus: string[]) => {
  setIsUpdating(true)
  await fetch('/api/applications/123', {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus })
  })
  setApplication(prev => ({ ...prev, status: newStatus }))
  setIsUpdating(false)
}
```

**After:**
```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate'

const { value: status, update: updateStatus, error } = useOptimisticUpdate<string[]>(
  application.status,
  {
    apiEndpoint: `/api/applications/${applicationId}`,
    method: 'PUT',
    getPayload: (newStatus) => ({ status: newStatus }),
  }
)

// Status badge updates INSTANTLY when clicked
<StatusBadge
  status={status}
  onClick={(newStatus) => updateStatus(newStatus)}
/>
```

### Example 3: Unit Availability Toggle

**Before:**
```tsx
const toggleAvailability = async () => {
  setIsUpdating(true)
  const newStatus = unit.status === 'Vacant' ? 'Occupied' : 'Vacant'
  await fetch('/api/units/456', {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus })
  })
  setUnit(prev => ({ ...prev, status: newStatus }))
  setIsUpdating(false)
}
```

**After:**
```tsx
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'

const { value: isVacant, toggle, error } = useOptimisticToggle(
  unit.status === 'Vacant',
  {
    apiEndpoint: `/api/units/${unitId}`,
    method: 'PUT',
    getPayload: (newValue) => ({
      status: newValue ? 'Vacant' : 'Occupied'
    }),
  }
)

// Toggle happens INSTANTLY
<button onClick={() => toggle()}>
  {isVacant ? '🟢 Vacant' : '🔴 Occupied'}
</button>
```

---

## All Available Hooks

### 1. `useOptimisticUpdate` - For updating existing values

**Use for:** Text fields, dropdowns, any field that updates an existing record

```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate'

const { value, update, isUpdating, error, reset } = useOptimisticUpdate<T>(
  initialValue,
  {
    apiEndpoint: '/api/resource/123',
    method: 'PUT', // or 'PATCH'
    debounceMs: 500, // Optional: debounce rapid changes
    onSuccess: (data) => console.log('Saved!'),
    onError: (err) => setShowErrorModal(true),
    getPayload: (value) => ({ fieldName: value }), // Transform before sending
  }
)
```

**Key Features:**
- ✅ Instant UI updates
- ✅ Automatic debouncing for text input
- ✅ Auto-reverts on error
- ✅ Cancels pending requests on unmount

### 2. `useOptimisticCreate` - For creating new records

**Use for:** "Add new" buttons, forms that create records

```tsx
import { useOptimisticCreate } from '@/hooks/useOptimisticCreate'

const { create, isCreating, error } = useOptimisticCreate<Application>({
  apiEndpoint: '/api/applications',
  onSuccess: (newApp) => {
    // newApp has the real ID from server
    router.push(`/applications/${newApp.id}`)
  },
})

// In your component:
const handleAddNew = async () => {
  const newApp = await create({
    applicant: 'John Doe',
    moveInDate: '01/01/2025',
  })

  if (newApp) {
    // Created successfully! Shows in list immediately
  }
}
```

**Key Features:**
- ✅ Generates temporary ID
- ✅ Item appears in list instantly
- ✅ Replaces temp ID with real server ID
- ✅ Removes item if creation fails

### 3. `useOptimisticDelete` - For deleting records

**Use for:** Delete buttons, remove actions

```tsx
import { useOptimisticDelete } from '@/hooks/useOptimisticDelete'

const { deleteItem, isDeleting, error, rollback } = useOptimisticDelete({
  onSuccess: () => console.log('Deleted!'),
  onError: (err) => setShowErrorModal(true),
})

const handleDelete = async () => {
  // Item disappears from UI INSTANTLY
  const success = await deleteItem(`/api/applications/${id}`)

  if (success) {
    router.push('/applications') // Redirect after delete
  }
}

// If error occurs, call rollback() to restore the item
```

**Key Features:**
- ✅ Instant removal from UI
- ✅ Automatic restoration on error
- ✅ Works with ConfirmModal pattern

### 4. `useOptimisticToggle` - For boolean/status toggles

**Use for:** Checkboxes, status switches, availability toggles

```tsx
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'

const { value, toggle, isToggling, error } = useOptimisticToggle(
  initialBooleanValue,
  {
    apiEndpoint: '/api/resource/123',
    fieldName: 'isActive', // Name of the boolean field
    onSuccess: (newValue) => console.log('Toggled to:', newValue),
  }
)

<input
  type="checkbox"
  checked={value}
  onChange={() => toggle()} // Instant toggle!
/>
```

**Key Features:**
- ✅ Instant visual feedback (no delay)
- ✅ Auto-reverts if server rejects
- ✅ Perfect for task completion, status switches

---

## Common Patterns

### Pattern 1: Debounced Text Input (Financial Fields)

```tsx
// For fields where users type quickly (rent amounts, names, etc.)
const { value: deposit, update: updateDeposit } = useOptimisticApplicationField({
  applicationId,
  fieldName: 'deposit',
  initialValue: application.deposit || '',
  debounceMs: 500, // Waits 500ms after typing stops before saving
})

<InlineTextField
  label="Security Deposit"
  value={deposit}
  onChange={updateDeposit}
  type="text"
  placeholder="$0.00"
/>
```

### Pattern 2: Instant Status Changes (No Debounce)

```tsx
// For discrete actions (status changes, toggles)
const { value: status, update: updateStatus } = useOptimisticUpdate<string[]>(
  application.status,
  {
    apiEndpoint: `/api/applications/${applicationId}`,
    method: 'PUT',
    debounceMs: 0, // No debounce - instant save
    getPayload: (newStatus) => ({ status: newStatus }),
  }
)
```

### Pattern 3: Error Handling with Modal

```tsx
const [showErrorModal, setShowErrorModal] = useState(false)
const [errorMessage, setErrorMessage] = useState('')

const { value, update, error } = useOptimisticUpdate<string>(
  initialValue,
  {
    apiEndpoint: '/api/resource/123',
    onError: (err) => {
      setErrorMessage(err.message)
      setShowErrorModal(true)
    },
  }
)

return (
  <>
    <YourComponent value={value} onChange={update} />

    <ErrorModal
      isOpen={showErrorModal}
      title="Save Failed"
      message={errorMessage}
      onRetry={() => {
        update(value) // Retry with current value
        setShowErrorModal(false)
      }}
      onCancel={() => {
        setShowErrorModal(false)
        // Hook automatically reverts to last saved value
      }}
    />
  </>
)
```

### Pattern 4: Create with Optimistic List Update

```tsx
// In your list component
const [applications, setApplications] = useState<Application[]>([])

const { create } = useOptimisticCreate<Application>({
  apiEndpoint: '/api/applications',
  onSuccess: (newApp) => {
    // Replace temp item with real item from server
    setApplications(prev =>
      prev.map(app =>
        app.id === newApp.id ? newApp : app
      )
    )
  },
})

const handleCreate = async (newAppData: Partial<Application>) => {
  const tempApp = await create(newAppData)

  if (tempApp) {
    // Add to list immediately with temp ID
    setApplications(prev => [tempApp, ...prev])
  }
}
```

### Pattern 5: Delete with Optimistic Removal

```tsx
const [applications, setApplications] = useState<Application[]>([])

const { deleteItem } = useOptimisticDelete({
  onSuccess: () => {
    toast.success('Application deleted')
  },
  onError: (err) => {
    // Item automatically restored to list
    toast.error(err.message)
  },
})

const handleDelete = async (appId: number) => {
  // Remove from UI immediately
  const deletedApp = applications.find(app => app.id === appId)
  setApplications(prev => prev.filter(app => app.id !== appId))

  // Try to delete on server
  const success = await deleteItem(`/api/applications/${appId}`)

  if (!success && deletedApp) {
    // Restore if failed (also done automatically by hook)
    setApplications(prev => [...prev, deletedApp])
  }
}
```

---

## Implementation Checklist

### For Each Field/Action You Want to Make Instant:

- [ ] **Identify the operation type:**
  - UPDATE existing value? → Use `useOptimisticUpdate`
  - CREATE new record? → Use `useOptimisticCreate`
  - DELETE record? → Use `useOptimisticDelete`
  - TOGGLE boolean? → Use `useOptimisticToggle`

- [ ] **Set up the hook:**
  ```tsx
  const { value, update, error } = useOptimisticUpdate(...)
  ```

- [ ] **Replace state with hook value:**
  ```tsx
  // Before: <Component value={stateValue} />
  // After:  <Component value={value} />
  ```

- [ ] **Replace onChange/onClick with hook function:**
  ```tsx
  // Before: onClick={() => handleSave(newValue)}
  // After:  onClick={() => update(newValue)}
  ```

- [ ] **Add error handling:**
  ```tsx
  useEffect(() => {
    if (error) setShowErrorModal(true)
  }, [error])
  ```

- [ ] **Test error scenarios:**
  - Disconnect network → make change → error modal appears
  - Click "Retry" → saves successfully
  - Click "Cancel" → reverts to last saved value

---

## Testing Your Implementation

### 1. Test Happy Path
```
1. Make a change
2. UI updates INSTANTLY ✅
3. Check browser devtools network tab
4. See API request complete in background
5. No loading spinner shown
```

### 2. Test Error Path (Chrome DevTools)
```
1. Open DevTools → Network tab
2. Select "Offline" mode
3. Make a change
4. UI updates instantly (optimistic)
5. After 2-3 seconds → ErrorModal appears
6. Click "Retry" → nothing (still offline)
7. Turn network back on
8. Click "Retry" → saves successfully
```

### 3. Test Debouncing (Text Fields)
```
1. Rapidly type in a field (e.g., "1000" → "2000" → "3000")
2. UI updates with each keystroke ✅
3. Check network tab
4. Only ONE request sent (500ms after typing stops) ✅
```

### 4. Test Concurrent Edits
```
1. Edit Field A
2. Immediately edit Field B
3. Both update instantly
4. Both save correctly in background
5. No race conditions
```

---

## Performance Tips

1. **Use debouncing for text input** (500ms is good default)
2. **No debounce for discrete actions** (clicks, toggles)
3. **Batch multiple field updates** if editing many fields at once
4. **Use `getPayload`** to only send changed fields, not entire object

---

## Migration Strategy

Don't refactor everything at once! Instead:

1. ✅ Start with **high-traffic fields** (rent, deposit, status)
2. ✅ Get comfortable with the pattern
3. ✅ Gradually apply to other components
4. ✅ Use this guide as reference

---

## Need Help?

All hooks are in `/src/hooks/`:
- `useOptimisticUpdate.ts` - Full implementation with comments
- `useOptimisticCreate.ts` - Creation pattern
- `useOptimisticDelete.ts` - Deletion pattern
- `useOptimisticToggle.ts` - Toggle pattern
- `useOptimisticApplicationField.ts` - Specialized for Application fields

Error handling:
- `/src/components/ErrorModal.tsx` - Ready to use modal
- `/src/lib/errorMessages.ts` - Error formatting utilities

Look at `/src/components/TasksList.tsx` (lines 309-380) for a working example of optimistic task completion toggle!
