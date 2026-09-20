import { useMemo } from 'react'
import { FileText, Download, FileSpreadsheet, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { analyzeAll, classSummary } from '../lib/analysis'

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { students, attendance, marks, loading } = useClassData()
  const analytics = useMemo(() => analyzeAll(students, attendance, marks), [students, attendance, marks])
  const summary = useMemo(() => classSummary(analytics), [analytics])

  const exportStudentCSV = () => {
    const rows: (string | number)[][] = [
      ['Roll No', 'Name', 'Department', 'Year', 'Section', 'Email', 'Attendance %', 'Avg Marks', 'Risk Level', 'Prediction'],
      ...analytics.map((a) => [
        a.student.roll_no, a.student.name, a.student.department, a.student.year, a.student.section,
        a.student.email ?? '', a.attendancePct.toFixed(0), a.avgMarks.toFixed(0), a.riskLevel, a.prediction,
      ]),
    ]
    downloadCSV('student_performance_report.csv', rows)
  }

  const exportMarksCSV = () => {
    const rows: (string | number)[][] = [['Roll No', 'Student', 'Subject', 'Internal', 'External', 'Total']]
    marks.forEach((m) => {
      const s = students.find((st) => st.id === m.student_id)
      rows.push([s?.roll_no ?? '', s?.name ?? '', m.subject, m.internal, m.external, m.total])
    })
    downloadCSV('marks_report.csv', rows)
  }

  const exportAttendanceCSV = () => {
    const rows: (string | number)[][] = [['Roll No', 'Student', 'Date', 'Status']]
    attendance.forEach((a) => {
      const s = students.find((st) => st.id === a.student_id)
      rows.push([s?.roll_no ?? '', s?.name ?? '', a.date, a.status])
    })
    downloadCSV('attendance_report.csv', rows)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Student Performance Report', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 27)
    doc.text(`Total Students: ${summary.totalStudents}  |  Avg Attendance: ${summary.avgAttendance.toFixed(0)}%  |  Avg Marks: ${summary.avgMarks.toFixed(0)}%  |  At Risk: ${summary.atRiskCount}`, 14, 33)

    autoTable(doc, {
      startY: 40,
      head: [['Roll', 'Name', 'Dept', 'Att %', 'Avg Marks', 'Risk', 'Prediction']],
      body: analytics.map((a) => [
        a.student.roll_no, a.student.name, a.student.department,
        `${a.attendancePct.toFixed(0)}%`, `${a.avgMarks.toFixed(0)}%`, a.riskLevel, a.prediction,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    })

    // Recommendations page
    const riskStudents = analytics.filter((a) => a.riskLevel !== 'Low')
    if (riskStudents.length) {
      doc.addPage()
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Recommendations', 14, 20)
      autoTable(doc, {
        startY: 26,
        head: [['Student', 'Risk', 'Recommendations']],
        body: riskStudents.map((a) => [a.student.name, a.riskLevel, a.recommendations.join(' ') || 'None']),
        styles: { fontSize: 8, cellWidth: 'wrap' },
        columnStyles: { 2: { cellWidth: 120 } },
        headStyles: { fillColor: [220, 38, 38] },
      })
    }

    doc.save('student_performance_report.pdf')
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <PageHeader title="Reports" subtitle="Export attendance, marks, and performance data" />

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={28} /></div>
          <h3>No data to export</h3>
          <p>Add students and records to generate reports.</p>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="card" style={{ padding: 20 }}>
              <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)', marginBottom: 12 }}>
                <FileSpreadsheet size={20} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>Student Performance CSV</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 14 }}>Full report with attendance, marks, risk, and predictions.</p>
              <button className="btn btn-primary" onClick={exportStudentCSV}><Download size={16} /> Download CSV</button>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', marginBottom: 12 }}>
                <FileSpreadsheet size={20} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>Marks CSV</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 14 }}>Subject-wise internal and external marks for all students.</p>
              <button className="btn btn-primary" onClick={exportMarksCSV}><Download size={16} /> Download CSV</button>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="stat-icon" style={{ background: 'var(--warning-light)', color: '#b45309', marginBottom: 12 }}>
                <FileSpreadsheet size={20} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>Attendance CSV</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 14 }}>Day-by-day attendance records for all students.</p>
              <button className="btn btn-primary" onClick={exportAttendanceCSV}><Download size={16} /> Download CSV</button>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)', marginBottom: 12 }}>
                <FileDown size={20} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>PDF Report</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 14 }}>Formatted PDF with summary table and recommendations.</p>
              <button className="btn btn-primary" onClick={exportPDF}><FileDown size={16} /> Download PDF</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Report Preview</h3></div>
            <div className="card-body">
              <div className="text-muted text-sm" style={{ marginBottom: 12 }}>
                {summary.totalStudents} students · {summary.avgAttendance.toFixed(0)}% avg attendance · {summary.avgMarks.toFixed(0)}% avg marks · {summary.atRiskCount} at risk
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll</th><th>Name</th><th>Att %</th><th>Avg Marks</th><th>Risk</th><th>Prediction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((a) => (
                      <tr key={a.student.id}>
                        <td>{a.student.roll_no}</td>
                        <td>{a.student.name}</td>
                        <td>{a.attendancePct.toFixed(0)}%</td>
                        <td>{a.avgMarks.toFixed(0)}%</td>
                        <td><span className={`badge ${a.riskLevel === 'High' ? 'badge-error' : a.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{a.riskLevel}</span></td>
                        <td className="text-sm text-muted">{a.prediction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
