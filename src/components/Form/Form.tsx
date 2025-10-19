'use client'

import { useState } from 'react'
import TextField from '../Field/TextField'
import Submit from '../Buttons/Submit/Submit'

export default function Form() {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    field3: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <TextField
        placeholder="Field 1"
        name="field1"
        value={formData.field1}
        onChange={handleChange}
      />
      <TextField
        placeholder="Field 2"
        name="field2"
        value={formData.field2}
        onChange={handleChange}
      />
      <TextField
        placeholder="Field 3"
        name="field3"
        value={formData.field3}
        onChange={handleChange}
      />
      <Submit />
    </div>
  )
}
