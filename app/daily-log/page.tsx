"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from 'usehooks-ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Clock, CheckCircle, XCircle, AlertCircle, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

type Medication = {
  id: number
  patientId: number
  patientName: string
  medicationName: string
  dosage: string
  frequency: string
  route?: string
  scheduledTime?: string
  instructions?: string
}
type Log = {
  id: number
  medicationId: number
  patientName: string
  medicationName: string
  scheduledTime?: string
  actualTime?: string | null
  status: string
  date: string
  notes?: string
}




export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [medicationsLS] = useLocalStorage<Medication[]>('medications', [])
  const [medications, setMedications] = useState<Medication[]>(medicationsLS)
  const [logsLS, setLogsLS] = useLocalStorage<Log[]>('logs', [])

  useEffect(() => {
    setMedications(medicationsLS)
  }, [medicationsLS])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [logData, setLogData] = useState({
    status: "",
    actualTime: "",
    notes: "",
  })

  const filteredMedications = medications.filter(
    (med: Medication) =>
      med.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.medicationName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const todaysLogs = logsLS.filter((log: Log) => log.date === format(selectedDate, "yyyy-MM-dd"))

  const handleLogMedication = () => {
    if (!selectedMedication) return;
    const newLog = {
      id: logsLS.length > 0 ? Math.max(...logsLS.map((l) => l.id || 0)) + 1 : 1,
      medicationId: selectedMedication.id,
      patientName: selectedMedication.patientName,
      medicationName: `${selectedMedication.medicationName} ${selectedMedication.dosage}`,
      scheduledTime: selectedMedication.scheduledTime,
      actualTime: logData.status === "taken" ? logData.actualTime : null,
      status: logData.status,
      date: format(selectedDate, "yyyy-MM-dd"),
      notes: logData.notes,
    }

    setLogsLS([...logsLS, newLog])
    setLogData({ status: "", actualTime: "", notes: "" })
    setSelectedMedication(null)
    setIsLogDialogOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "missed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "delayed":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      taken: "default",
      missed: "destructive",
      delayed: "secondary",
    }
    const variant = variants[status] || "outline"
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Daily Medication Log</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Medication Logging</h2>
            <p className="text-gray-600">Track daily medication intake for all patients</p>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Medications</CardTitle>
              <CardDescription>Medications due for {format(selectedDate, "PPP")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medications or patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredMedications.map((medication: Medication) => {
                  const existingLog = todaysLogs.find((log: Log) => log.medicationId === medication.id)

                  return (
                    <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(existingLog?.status || "pending")}
                          <p className="font-medium text-sm">{medication.patientName}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {medication.medicationName} {medication.dosage}
                        </p>
                        <p className="text-xs text-gray-500">Scheduled: {medication.scheduledTime}</p>
                        {medication.instructions && <p className="text-xs text-blue-600">{medication.instructions}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {existingLog ? (
                          getStatusBadge(existingLog.status)
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedMedication(medication)
                              setIsLogDialogOpen(true)
                            }}
                          >
                            Log
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        
          <Card>
            <CardHeader>
              <CardTitle>Todays Medication Logs</CardTitle>
              <CardDescription>Completed medication records for {format(selectedDate, "PPP")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No medications logged for this date</p>
                  </div>
                ) : (
                  todaysLogs.map((log: Log) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <p className="font-medium text-sm">{log.patientName}</p>
                        </div>
                        {getStatusBadge(log.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.medicationName}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Scheduled: {log.scheduledTime}</span>
                        {log.actualTime && <span>Actual: {log.actualTime}</span>}
                      </div>
                      {log.notes && <p className="text-xs text-gray-600 mt-2 italic">{log.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Medication Dialog */}
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Medication</DialogTitle>
              <DialogDescription>Record medication intake for {selectedMedication?.patientName}</DialogDescription>
            </DialogHeader>

            {selectedMedication && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    {selectedMedication.medicationName} {selectedMedication.dosage}
                  </p>
                  <p className="text-sm text-gray-600">Scheduled for {selectedMedication.scheduledTime}</p>
                  {selectedMedication.instructions && (
                    <p className="text-sm text-blue-600">{selectedMedication.instructions}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setLogData({ ...logData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taken">Taken</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {logData.status === "taken" && (
                  <div>
                    <Label htmlFor="actualTime">Actual Time Taken</Label>
                    <Input
                      id="actualTime"
                      type="time"
                      value={logData.actualTime}
                      onChange={(e) => setLogData({ ...logData, actualTime: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the medication intake..."
                    value={logData.notes}
                    onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogMedication} disabled={!logData.status}>
                Log Medication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
