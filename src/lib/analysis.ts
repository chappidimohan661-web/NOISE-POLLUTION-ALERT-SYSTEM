import type { Student, AttendanceRow, MarksRow } from './supabase'

export interface StudentAnalytics {
  student: Student
  attendancePct: number
  presentCount: number
  totalCount: number
  absentCount: number
  lateCount: number
  avgMarks: number
  subjectMarks: { subject: string; total: number; pct: number }[]
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
  prediction: string
  insights: string[]
  recommendations: string[]
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

export function attendancePct(rows: AttendanceRow[]): { pct: number; present: number; total: number; absent: number; late: number } {
  const total = rows.length
  if (total === 0) return { pct: 0, present: 0, total: 0, absent: 0, late: 0 }
  const present = rows.filter((r) => r.status === 'present').length
  const late = rows.filter((r) => r.status === 'late').length
  const absent = rows.filter((r) => r.status === 'absent').length
  const effective = present + late * 0.5
  return { pct: clamp((effective / total) * 100), present, total, absent, late }
}

export function marksForStudent(marks: MarksRow[], studentId: string) {
  const sm = marks.filter((m) => m.student_id === studentId)
  const subjectMarks = sm.map((m) => ({
    subject: m.subject,
    total: m.total,
    pct: clamp((m.total / 100) * 100),
  }))
  const avg = subjectMarks.length
    ? subjectMarks.reduce((s, m) => s + m.pct, 0) / subjectMarks.length
    : 0
  return { subjectMarks, avgMarks: avg }
}

export function analyzeStudent(
  student: Student,
  attendance: AttendanceRow[],
  marks: MarksRow[]
): StudentAnalytics {
  const att = attendancePct(attendance)
  const { subjectMarks, avgMarks } = marksForStudent(marks, student.id)

  // Risk score: weighted blend of attendance and marks.
  // Low attendance and low marks => higher risk.
  const attGap = Math.max(0, 85 - att.pct) // below 85% is a concern
  const marksGap = Math.max(0, 75 - avgMarks) // below 75% avg is a concern
  const riskScore = clamp(attGap * 0.6 + marksGap * 0.8 + (att.absent > 5 ? 5 : 0))

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
  if (riskScore >= 25) riskLevel = 'High'
  else if (riskScore >= 10) riskLevel = 'Medium'

  const insights: string[] = []
  const recommendations: string[] = []

  if (att.pct < 65) {
    insights.push(`Attendance is critically low at ${att.pct.toFixed(0)}% (${att.absent} absences).`)
    recommendations.push('Attendance must improve above 85% — schedule a counselling session.')
  } else if (att.pct < 85) {
    insights.push(`Attendance is below the 85% threshold at ${att.pct.toFixed(0)}%.`)
    recommendations.push('Encourage regular attendance to avoid academic risk.')
  } else {
    insights.push(`Attendance is healthy at ${att.pct.toFixed(0)}%.`)
  }

  if (avgMarks < 40) {
    insights.push(`Average marks are failing at ${avgMarks.toFixed(0)}%.`)
    recommendations.push('Assign remedial practice tests and weekly mentoring.')
  } else if (avgMarks < 75) {
    insights.push(`Average marks are ${avgMarks.toFixed(0)}% — below the 75% target.`)
    recommendations.push('Targeted practice in weak subjects to raise scores above 75%.')
  } else {
    insights.push(`Average marks are strong at ${avgMarks.toFixed(0)}%.`)
  }

  // Weakest subject
  if (subjectMarks.length) {
    const weakest = [...subjectMarks].sort((a, b) => a.pct - b.pct)[0]
    if (weakest.pct < 75) {
      insights.push(`Weakest subject is ${weakest.subject} at ${weakest.pct.toFixed(0)}%.`)
      recommendations.push(`Extra focus on ${weakest.subject} — assign practice problem sets.`)
    }
    const strongest = [...subjectMarks].sort((a, b) => b.pct - a.pct)[0]
    if (strongest.pct >= 75) {
      insights.push(`Strongest subject is ${strongest.subject} at ${strongest.pct.toFixed(0)}%.`)
    }
  } else {
    insights.push('No marks recorded yet — prediction is attendance-based only.')
  }

  let prediction = 'On track to perform well.'
  if (riskLevel === 'High') {
    prediction = 'At high risk of underperformance — intervention recommended.'
  } else if (riskLevel === 'Medium') {
    prediction = 'Moderate risk — monitor closely and provide light support.'
  }

  return {
    student,
    attendancePct: att.pct,
    presentCount: att.present,
    totalCount: att.total,
    absentCount: att.absent,
    lateCount: att.late,
    avgMarks,
    subjectMarks,
    riskScore,
    riskLevel,
    prediction,
    insights,
    recommendations,
  }
}

export function analyzeAll(
  students: Student[],
  attendance: AttendanceRow[],
  marks: MarksRow[]
): StudentAnalytics[] {
  return students.map((s) => {
    const att = attendance.filter((a) => a.student_id === s.id)
    return analyzeStudent(s, att, marks)
  })
}

export interface ClassSummary {
  totalStudents: number
  avgAttendance: number
  avgMarks: number
  topper: StudentAnalytics | null
  weakStudents: StudentAnalytics[]
  atRiskCount: number
  attendanceDistribution: { present: number; absent: number; late: number }
  subjectAverages: { subject: string; avg: number }[]
  riskDistribution: { Low: number; Medium: number; High: number }
}

export function classSummary(analytics: StudentAnalytics[]): ClassSummary {
  const totalStudents = analytics.length
  const avgAttendance = totalStudents
    ? analytics.reduce((s, a) => s + a.attendancePct, 0) / totalStudents
    : 0
  const avgMarks = totalStudents
    ? analytics.reduce((s, a) => s + a.avgMarks, 0) / totalStudents
    : 0

  const sorted = [...analytics].sort((a, b) => b.avgMarks - a.avgMarks)
  const topper = sorted[0] ?? null
  const weakStudents = sorted.filter((a) => a.riskLevel !== 'Low').sort((a, b) => a.riskScore - b.riskScore)

  const atRiskCount = analytics.filter((a) => a.riskLevel === 'High').length

  const present = analytics.reduce((s, a) => s + a.presentCount, 0)
  const absent = analytics.reduce((s, a) => s + a.absentCount, 0)
  const late = analytics.reduce((s, a) => s + a.lateCount, 0)

  const subjectMap = new Map<string, number[]>()
  analytics.forEach((a) => {
    a.subjectMarks.forEach((sm) => {
      if (!subjectMap.has(sm.subject)) subjectMap.set(sm.subject, [])
      subjectMap.get(sm.subject)!.push(sm.pct)
    })
  })
  const subjectAverages = Array.from(subjectMap.entries()).map(([subject, arr]) => ({
    subject,
    avg: arr.reduce((s, n) => s + n, 0) / arr.length,
  }))

  const riskDistribution = {
    Low: analytics.filter((a) => a.riskLevel === 'Low').length,
    Medium: analytics.filter((a) => a.riskLevel === 'Medium').length,
    High: analytics.filter((a) => a.riskLevel === 'High').length,
  }

  return {
    totalStudents,
    avgAttendance,
    avgMarks,
    topper,
    weakStudents,
    atRiskCount,
    attendanceDistribution: { present, absent, late },
    subjectAverages,
    riskDistribution,
  }
}

// Natural language Q&A over the analytics — the "LLM layer" using rule-based explanation.
export function answerQuery(query: string, analytics: StudentAnalytics[], summary: ClassSummary): string {
  const q = query.toLowerCase().trim()

  const findStudent = (name: string) =>
    analytics.find((a) => a.student.name.toLowerCase().includes(name.toLowerCase()))

  // Risk / at-risk students
  if (/(at risk|risk|weak|struggling|failing)/.test(q) && !findStudentByName(q)) {
    if (summary.atRiskCount === 0) return 'No students are currently at high risk. The class is performing well overall.'
    const high = analytics.filter((a) => a.riskLevel === 'High')
    const list = high.map((a) => `${a.student.name} (${a.attendancePct.toFixed(0)}% attendance, ${a.avgMarks.toFixed(0)}% marks)`).join(', ')
    return `${summary.atRiskCount} student${summary.atRiskCount > 1 ? 's are' : ' is'} at high risk: ${list}. Recommendation: schedule parent meetings and counselling sessions.`
  }

  // Attendance-related
  if (/attendance/.test(q)) {
    if (/average|overall|class/.test(q)) {
      return `Class average attendance is ${summary.avgAttendance.toFixed(0)}%. ${summary.attendanceDistribution.present} present, ${summary.attendanceDistribution.absent} absent, and ${summary.attendanceDistribution.late} late records overall.`
    }
    const low = analytics.filter((a) => a.attendancePct < 65).sort((a, b) => a.attendancePct - b.attendancePct)
    if (low.length) {
      return `${low.length} student${low.length > 1 ? 's have' : ' has'} attendance below 65%: ${low.map((a) => `${a.student.name} (${a.attendancePct.toFixed(0)}%)`).join(', ')}. Recommend immediate counselling.`
    }
    return 'All students have attendance above 65%. No attendance concerns right now.'
  }

  // Marks / performance
  if (/(mark|score|performance|average|cgpa)/.test(q)) {
    if (/average|overall|class/.test(q)) {
      return `Class average marks are ${summary.avgMarks.toFixed(0)}% across all subjects. Subject averages: ${summary.subjectAverages.map((s) => `${s.subject} ${s.avg.toFixed(0)}%`).join(', ')}.`
    }
    const topper = summary.topper
    if (topper) return `Top performer is ${topper.student.name} with ${topper.avgMarks.toFixed(0)}% average marks and ${topper.attendancePct.toFixed(0)}% attendance.`
  }

  // Topper
  if (/(topper|top performer|best student|highest)/.test(q)) {
    if (summary.topper) return `Top performer is ${summary.topper.student.name} with ${summary.topper.avgMarks.toFixed(0)}% average marks and ${summary.topper.attendancePct.toFixed(0)}% attendance.`
    return 'No marks data available to determine the topper yet.'
  }

  // Improvement / how can I improve
  if (/(improve|improvement|how can i|suggest|recommend)/.test(q)) {
    const lines: string[] = []
    lines.push('To improve performance:')
    lines.push('1. Maintain attendance above 85%.')
    lines.push('2. Score above 75% in internal exams.')
    lines.push('3. Complete all pending assignments on time.')
    lines.push('4. Practice Data Structures weekly.')
    lines.push('5. Attend lab sessions regularly.')
    if (summary.weakStudents.length) {
      lines.push(`Priority students needing support: ${summary.weakStudents.slice(0, 5).map((a) => a.student.name).join(', ')}.`)
    }
    return lines.join('\n')
  }

  // Per-student query
  const student = findStudentByName(q)
  if (student) {
    const a = findStudent(student)!
    const lines: string[] = []
    lines.push(`${a.student.name} (Roll ${a.student.roll_no}, ${a.student.department} Year ${a.student.year} Sec ${a.student.section}):`)
    lines.push(`Attendance: ${a.attendancePct.toFixed(0)}% (${a.presentCount} present, ${a.absentCount} absent, ${a.lateCount} late).`)
    lines.push(`Average marks: ${a.avgMarks.toFixed(0)}%.`)
    if (a.subjectMarks.length) {
      lines.push(`Subject breakdown: ${a.subjectMarks.map((m) => `${m.subject} ${m.pct.toFixed(0)}%`).join(', ')}.`)
    }
    lines.push(`Risk level: ${a.riskLevel} (score ${a.riskScore.toFixed(0)}).`)
    lines.push(`Prediction: ${a.prediction}`)
    if (a.recommendations.length) lines.push(`Recommendations: ${a.recommendations.join(' ')}`)
    return lines.join('\n')
  }

  // Why is X's performance decreasing
  if (/why/.test(q)) {
    const student = findStudentByName(q)
    if (student) {
      const a = findStudent(student)!
      const lines: string[] = []
      lines.push(`Analysis for ${a.student.name}:`)
      a.insights.forEach((i) => lines.push(`- ${i}`))
      if (a.recommendations.length) lines.push(`Recommendation: ${a.recommendations.join(' ')}`)
      return lines.join('\n')
    }
  }

  // Summary / overview
  if (/(summary|overview|report|status|how.*class|class.*doing)/.test(q)) {
    const lines: string[] = []
    lines.push(`Class overview:`)
    lines.push(`- Total students: ${summary.totalStudents}`)
    lines.push(`- Average attendance: ${summary.avgAttendance.toFixed(0)}%`)
    lines.push(`- Average marks: ${summary.avgMarks.toFixed(0)}%`)
    lines.push(`- Students at high risk: ${summary.atRiskCount}`)
    if (summary.topper) lines.push(`- Top performer: ${summary.topper.student.name} (${summary.topper.avgMarks.toFixed(0)}%)`)
    if (summary.weakStudents.length) lines.push(`- Students needing support: ${summary.weakStudents.length}`)
    return lines.join('\n')
  }

  // Default
  return `I can answer questions about student attendance, marks, performance predictions, risk levels, toppers, and recommendations. Try asking "Which students are at risk?", "What is the class average attendance?", or "How is Rahul performing?".`
}

function findStudentByName(q: string): string | null {
  // Extract a capitalized name token from the query
  const match = q.match(/\b([A-Z][a-z]+)\b/)
  return match ? match[1] : null
}
