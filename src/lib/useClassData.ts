import { useEffect, useState, useCallback } from 'react'
import { supabase, type Student, type AttendanceRow, type MarksRow } from './supabase'
import { useAuth } from './auth'

export function useClassData() {
  const { session } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [marks, setMarks] = useState<MarksRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const [s, a, m] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: true }),
      supabase.from('attendance').select('*'),
      supabase.from('marks').select('*'),
    ])
    setStudents((s.data as Student[]) ?? [])
    setAttendance((a.data as AttendanceRow[]) ?? [])
    setMarks((m.data as MarksRow[]) ?? [])
    setLoading(false)
  }, [session])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return { students, attendance, marks, loading, reload: loadAll, setStudents, setAttendance, setMarks }
}
