"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Pill, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'
import { useMemo } from 'react'

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
  date: string
  actualTime?: string
  status: 'taken' | 'missed'
}

export default function Dashboard() {
  const [ patients ] = useLocalStorage<Patient[]>('patients', [])
  const [ medications ] = useLocalStorage<Medication[]>('medications', [])
  const [ logs ] = useLocalStorage<Log[]>('logs', [])

  const today = new Date().toISOString().split('T')[0]
  const stats = useMemo(() => {
    const totalPatients = patients.length
    const medsToday = medications.filter(med => {
      // If medication has a startDate and endDate, check if today is in range
      if (med.startDate && med.endDate) {
        return med.startDate <= today && med.endDate >= today
      }
      return true
    })

  const medicationsToday = medsToday.length
  const logsToday = logs.filter(log => log.date === today)
  const completedToday = logsToday.filter(log => log.status === 'taken').length 
  const missedToday = logsToday.filter(log => log.status === 'missed').length
  const adherenceRate = medicationsToday > 0 ? Math.round((completedToday / medicationsToday) * 100) : 0
  
  return {
    totalPatients,
    medicationsToday,
    completedToday,
    missedToday,
    adherenceRate,
  }
  }, [patients, medications, logs, today])

  const recentLogs = useMemo(() => {
    return logs
      .slice()
      .sort((a , b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .slice(0, 4)
      .map(log => ({
        id: log.id,
        patient: log.patientName,
        medication: log.medicationName,
        time: log.actualTime || '',
        status: log.status,
      }))
  }, [logs])

  const upcomingMedications = useMemo(() => {
    return medications
      .filter(med => med.scheduledTime && (!med.endDate || med.endDate >= today) && (!med.startDate || med.startDate <= today))
      .map(med => ({
        id: med.id,
        patient: med.patientName,
        medication: `${med.medicationName} ${med.dosage || '' }`.trim(),
        scheduledTime: med.scheduledTime,
      }))
      .slice(0, 4)
  }, [medications, today])

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <Pill className='h-8 w-8 text-blue-600 mr-3' />
              <h1 className='text-2xl font-bold text-gray-900'>MedLog</h1>
            </div>
            <nav className='flex space-x-4'>
              <Link href='/patients'>
                <Button variant='ghost'>Patients</Button>
              </Link>
              <Link href='/medications'>
                <Button variant='ghost'>Medications</Button>
              </Link>
              <Link href='daily-log'>
                <Button variant='ghost'>Daily Log</Button>
              </Link>
              <Link href='reports'>
                <Button variant='ghost'>Reports</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Dashboard</h2>
          <p className='text-gray-600'>Overview of todays medication management</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Patients</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalPatients}</div>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Medications Today</CardTitle>
              <Pill className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.medicationsToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <TrendingUp className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.completedToday}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Missed</CardTitle>
              <AlertTriangle className='h-4 w-4 text-red-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>{stats.missedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Adherence Rate</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.adherenceRate}%</div>
            </CardContent>
          </Card>
        </div>


        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Clock className='h-5 w-5 mr-2' />
                Recent Medication Logs
              </CardTitle>
              <CardDescription>Latest medication intake records </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log) => (
                    <div key={log.id}>
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    
                          <p className="font-medium text-sm">{log.patient}</p>
                          <p className="text-sm text-gray-600">{log.medication}</p>
                          <p className="text-xs text-gray-500">{log.time}</p>
                      </div>
                      <Badge variant={log.status === "taken" ? "default" : "destructive"}>{log.status}</Badge>
                    </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/daily-log">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Logs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Calendar className='h-5 w-5 mr-2' />
                  Upcoming Medications
                </CardTitle>
                <CardDescription>Medications scheduled for later today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {upcomingMedications.map((med) => (
                    <div key={med.id} className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                      <div>
                        <p className='font-medium text-sm'>{med.patient}</p>
                        <p className='text-sm text-gray-600'>{med.medication}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-blue-600'>{med.scheduledTime}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-4'>
                  <Link href='/daily-log'>
                    <Button className='w-full'>Log Medications</Button>
                  </Link>
                </div>

              </CardContent>
          </Card>
        </div>


      </main>

    </div>
  );
}
