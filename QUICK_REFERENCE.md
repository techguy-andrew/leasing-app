# Optimistic UI - Quick Reference Card

## 🚀 Copy-Paste Patterns

### Pattern 1: Text Fields (Rent, Deposit, Names)

```tsx
import { useOptimisticApplicationField } from '@/hooks/useOptimisticApplicationField'
import ErrorModal from '@/components/ErrorModal'

// In your component:
const [showErrorModal, setShowErrorModal] = useState(false)

const { value: rent, update: updateRent, error } = useOptimisticApplicationField({
  applicationId,
  fieldName: 'rent',
  initialValue: application.rent || '',
  debounceMs: 500,
  onError: () => setShowErrorModal(true)
})

// In JSX:
<InlineTextField
  value={rent}
  onChange={updateRent}
/>

<ErrorModal
  isOpen={showErrorModal}
  title="Failed to Save"
  message={error?.message || 'Could not save'}
  onRetry={() => {
    updateRent(rent)
    setShowErrorModal(false)
  }}
  onCancel={() => setShowErrorModal(false)}
/>
```

---

### Pattern 2: Status Changes (Instant Badges)

```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate'

const { value: status, update: updateStatus, error } = useOptimisticUpdate<string[]>(
  application.status,
  {
    apiEndpoint: `/api/applications/${applicationId}`,
    method: 'PUT',
    getPayload: (newStatus) => ({ status: newStatus }),
    onError: () => setShowErrorModal(true)
  }
)

<StatusBadge
  status={status}
  onClick={(newStatus) => updateStatus(newStatus)}
/>
```

---

### Pattern 3: Boolean Toggle (Availability, Checkboxes)

```tsx
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'

const { value: isVacant, toggle, error } = useOptimisticToggle(
  unit.status === 'Vacant',
  {
    apiEndpoint: `/api/units/${unitId}`,
    method: 'PUT',
    getPayload: (val) => ({ status: val ? 'Vacant' : 'Occupied' }),
  }
)

<button onClick={() => toggle()}>
  {isVacant ? 'Vacant' : 'Occupied'}
</button>
```

---

### Pattern 4: Create New Item

```tsx
import { useOptimisticCreate } from '@/hooks/useOptimisticCreate'

const { create, isCreating } = useOptimisticCreate<Application>({
  apiEndpoint: '/api/applications',
  onSuccess: (newApp) => router.push(`/applications/${newApp.id}`)
})

const handleCreate = async () => {
  const app = await create({ applicant: 'John Doe', ... })
  if (app) {
    // Created! Shows in list instantly
  }
}
```

---

### Pattern 5: Delete Item

```tsx
import { useOptimisticDelete } from '@/hooks/useOptimisticDelete'

const { deleteItem } = useOptimisticDelete({
  onSuccess: () => router.push('/applications')
})

const handleDelete = async () => {
  // Remove from UI instantly
  setApplications(prev => prev.filter(a => a.id !== appId))

  // Try to delete on server
  await deleteItem(`/api/applications/${appId}`)
  // Automatically restored if fails
}
```

---

## 📁 File Locations

**Hooks** (in `/src/hooks/`):
- `useOptimisticUpdate.ts` - Text fields, dropdowns
- `useOptimisticCreate.ts` - Create new records
- `useOptimisticDelete.ts` - Delete records
- `useOptimisticToggle.ts` - Checkboxes, status toggles
- `useOptimisticApplicationField.ts` - Specialized for Application fields

**Components**:
- `/src/components/ErrorModal.tsx` - Error handling modal
- `/src/components/OptimisticFieldExample.tsx` - Working example

**Utilities** (in `/src/lib/`):
- `errorMessages.ts` - Error formatting
- `tempId.ts` - Temp ID generation
- `debounce.ts` - Debouncing

**Docs**:
- `OPTIMISTIC_UI_GUIDE.md` - Full implementation guide
- `QUICK_REFERENCE.md` - This file

---

## ⚡ When to Use Each Hook

| Operation | Hook | Debounce? | Example |
|-----------|------|-----------|---------|
| Edit text field | `useOptimisticUpdate` | ✅ Yes (500ms) | Rent, deposit, names |
| Click status | `useOptimisticUpdate` | ❌ No | Status badges |
| Toggle checkbox | `useOptimisticToggle` | ❌ No | Task completion |
| Add new item | `useOptimisticCreate` | ❌ No | New application |
| Delete item | `useOptimisticDelete` | ❌ No | Delete button |

---

## ✅ Implementation Checklist

For each field you want to make instant:

1. [ ] Import the appropriate hook
2. [ ] Replace `useState` with hook
3. [ ] Update `value` prop to use hook's `value`
4. [ ] Update `onChange` to call hook's `update`/`toggle`/`create`
5. [ ] Add `ErrorModal` for error handling
6. [ ] Test with network offline in DevTools

---

## 🧪 Testing Checklist

- [ ] Edit field → UI updates instantly ✅
- [ ] Check network tab → request sent in background ✅
- [ ] Turn network offline → edit field → error modal appears ✅
- [ ] Click "Retry" → saves when network returns ✅
- [ ] Click "Cancel" → value reverts to last saved ✅
- [ ] Rapidly type → only one request sent (debounced) ✅

---

## 💡 Pro Tips

1. **Use 500ms debounce for text input** - Good balance between responsiveness and server load
2. **No debounce for clicks** - Status changes, toggles should save immediately
3. **Always add ErrorModal** - Users need to know when save fails
4. **Test offline mode** - Make sure error handling works
5. **Start with high-traffic fields** - Rent, deposit, status get edited most

---

## 🆘 Common Issues

**Issue**: "Value reverts immediately after typing"
- **Fix**: Make sure you're using the hook's `value`, not state

**Issue**: "Multiple requests sent while typing"
- **Fix**: Add `debounceMs: 500` to hook options

**Issue**: "Error modal doesn't show"
- **Fix**: Add `onError: () => setShowErrorModal(true)` to hook

**Issue**: "Value doesn't update"
- **Fix**: Check `getPayload` - make sure field name matches API

---

## 📞 Need Help?

1. Check `/src/components/OptimisticFieldExample.tsx` - Working example
2. Read `OPTIMISTIC_UI_GUIDE.md` - Full documentation
3. Look at `/src/components/TasksList.tsx` (lines 309-380) - Live example in codebase
