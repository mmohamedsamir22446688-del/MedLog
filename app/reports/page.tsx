"use client"

import { useState, useMemo } from "react"
import { useLocalStorage } from 'usehooks-ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { BarChart, TrendingUp, TrendingDown, Users, Pill, Calendar, Download } from "lucide-react"
import Link from "next/link"

type Patient = {
  id: number
  name: string
  age: number
  gender: string
  phone: string
  email: string
  dateOfBirth: string
  address: string
  emergencyContact: string
  medicalConditions: string[]
  activeMedications: number
  lastVisit: string
}

type Medication = {
  id: number
  patientId: number
  patientName: string
  medicationName: string
  dosage?: string
  startDate?: string
  endDate?: string
  scheduledTime?: string
}

type Log = {
  id: number
  patientName: string
  medicationName: string
  scheduledTime?: string
  actualTime?: string
  status: 'taken' | 'missed'
  date: string
  notes?: string
}

function arrayToCSV(data: Log[], columns: (keyof Log)[]): string {
  const header = columns.join(",")
  const rows = data.map(row =>
    columns.map(col => {
      let val = row[col]
      if (val === undefined || val === null) val = ''
      // Escape quotes
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(",")
  )
  return [header, ...rows].join("\r\n")
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getWeekNumber(dateString: string) {
  const d = new Date(dateString)
  const onejan = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7)
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const [patients] = useLocalStorage<Patient[]>('patients', [])
  const [medications] = useLocalStorage<Medication[]>('medications', [])
  const [logs] = useLocalStorage<Log[]>('logs', [])

  const adherenceData = useMemo(() => {
    return patients.map((patient) => {
      const patientMeds = medications.filter(med => med.patientId === patient.id)
      const patientLogs = logs.filter(log => log.patientName === patient.name)
      const taken = patientLogs.filter(log => log.status === 'taken').length
      const missed = patientLogs.filter(log => log.status === 'missed').length
      const totalMeds = patientMeds.length > 0 ? patientMeds.length : taken + missed
      const adherenceRate = totalMeds > 0 ? Math.round((taken / totalMeds) * 100) : 0
      return {
        patient: patient.name,
        totalMeds,
        taken,
        missed,
        adherenceRate,
      }
    })
  }, [patients, medications, logs])

  const medicationStats = useMemo(() => {
    const medMap: Record<string, { prescribed: number; taken: number; adherenceRate: number }> = {}
    medications.forEach(med => {
      if (!medMap[med.medicationName]) {
        medMap[med.medicationName] = { prescribed: 0, taken: 0, adherenceRate: 0 }
      }
      medMap[med.medicationName].prescribed++
    })
    logs.forEach(log => {
      if (log.status === 'taken' && medMap[log.medicationName]) {
        medMap[log.medicationName].taken++
      }
    })
    Object.keys(medMap).forEach(name => {
      const m = medMap[name]
      m.adherenceRate = m.prescribed > 0 ? Math.round((m.taken / m.prescribed) * 100) : 0
    })
    return Object.entries(medMap).map(([medication, data]) => ({ medication, ...data }))
  }, [medications, logs])


  const weeklyTrends = useMemo(() => {
    const weekMap: Record<string, { week: string; taken: number; total: number }> = {}
    logs.forEach(log => {
      const weekNum = getWeekNumber(log.date)
      const year = new Date(log.date).getFullYear()
      const key = `${year}-W${weekNum}`
      if (!weekMap[key]) weekMap[key] = { week: key, taken: 0, total: 0 }
      if (log.status === 'taken') weekMap[key].taken++
      weekMap[key].total++
    })
    const weeks = Object.values(weekMap)
      .sort((a, b) => (a.week < b.week ? 1 : -1))
      .slice(0, 4)
      .reverse()
    return weeks.map(w => ({
      week: w.week,
      adherenceRate: w.total > 0 ? Math.round((w.taken / w.total) * 100) : 0,
    }))
  }, [logs])


  const overallStats = useMemo(() => {
    const totalPatients = patients.length
    const totalMedications = medications.length
    const totalMissed = logs.filter(log => log.status === 'missed').length
    const adherenceRates = adherenceData.map(p => p.adherenceRate)
    const averageAdherence = adherenceRates.length > 0 ? Math.round(adherenceRates.reduce((a, b) => a + b, 0) / adherenceRates.length) : 0
    return { totalPatients, totalMedications, totalMissed, averageAdherence }
  }, [patients, medications, logs, adherenceData])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <BarChart className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              </Link>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Medication Reports</h2>
            <p className="text-gray-600">Analyze medication adherence and patient outcomes</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                // Export logs as CSV
                const columns: (keyof Log)[] = [
                  'id',
                  'patientName',
                  'medicationName',
                  'scheduledTime',
                  'actualTime',
                  'status',
                  'date',
                  'notes',
                ]
                const csv = arrayToCSV(logs, columns)
                downloadCSV('medication-logs.csv', csv)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Adherence</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallStats.averageAdherence}%</div>
              <p className="text-xs text-muted-foreground">+2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalMedications}</div>
              <p className="text-xs text-muted-foreground">Scheduled this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missed Doses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overallStats.totalMissed}</div>
              <p className="text-xs text-muted-foreground">-3 from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  
          <Card>
            <CardHeader>
              <CardTitle>Patient Adherence Report</CardTitle>
              <CardDescription>Medication adherence rates by patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adherenceData.map((patient, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{patient.patient}</span>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            patient.adherenceRate >= 90
                              ? "default"
                              : patient.adherenceRate >= 80
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {patient.adherenceRate}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={patient.adherenceRate} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Taken: {patient.taken}</span>
                      <span>Missed: {patient.missed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medication Performance</CardTitle>
              <CardDescription>Adherence rates by medication type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicationStats.map((med, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{med.medication}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{med.prescribed} patients</span>
                        <Badge variant={med.adherenceRate >= 90 ? "default" : "secondary"}>{med.adherenceRate}%</Badge>
                      </div>
                    </div>
                    <Progress value={med.adherenceRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Adherence Trends
            </CardTitle>
            <CardDescription>Medication adherence trends over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {weeklyTrends.map((week, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">{week.week}</p>
                  <p className="text-2xl font-bold text-blue-600">{week.adherenceRate}%</p>
                  <div className="mt-2">
                    {index > 0 && (
                      <div className="flex items-center justify-center">
                        {week.adherenceRate > weeklyTrends[index - 1].adherenceRate ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>a
            <CardTitle>Detailed Patient Analysis</CardTitle>
            <CardDescription>Comprehensive medication tracking data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Patient</th>
                    <th className="text-left p-2">Total Medications</th>
                    <th className="text-left p-2">Taken</th>
                    <th className="text-left p-2">Missed</th>
                    <th className="text-left p-2">Adherence Rate</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adherenceData.map((patient, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{patient.patient}</td>
                      <td className="p-2">{patient.totalMeds}</td>
                      <td className="p-2 text-green-600">{patient.taken}</td>
                      <td className="p-2 text-red-600">{patient.missed}</td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Progress value={patient.adherenceRate} className="h-2 w-16" />
                          <span>{patient.adherenceRate}%</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            patient.adherenceRate >= 90
                              ? "default"
                              : patient.adherenceRate >= 80
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {patient.adherenceRate >= 90
                            ? "Excellent"
                            : patient.adherenceRate >= 80
                              ? "Good"
                              : "Needs Attention"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

