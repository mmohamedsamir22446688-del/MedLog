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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Pill, Clock, User, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

type Medication = {
  id: number
  patientId: number
  patientName: string
  medicationName: string
  dosage: string
  frequency: string
  route: string
  startDate: string
  endDate: string
  prescribedBy: string
  instructions: string
  sideEffects: string
  isActive: boolean
}
type Patient = {
  id: number
  name: string
}

const mockMedications: Medication[] = []

type Log = {
  id: number
  medicationId: number
  patientId: number
  patientName: string
  medicationName: string
  dosage: string
  frequency: string
  route: string
  prescribedBy: string
  date: string
  status: string
  notes: string
}

export default function MedicationsPage() {
  const [medicationsLS, setMedicationsLS] = useLocalStorage('medications', mockMedications)
  const [medications, setMedications] = useState(medicationsLS)
  const [patientsLS] = useLocalStorage<Patient[]>('patients', [])
  const [logsLS, setLogsLS] = useLocalStorage<Log[]>('logs', [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPatient, setFilterPatient] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMedication, setNewMedication] = useState({
    patientId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    route: "",
    startDate: "",
    endDate: "",
    prescribedBy: "",
    instructions: "",
    sideEffects: "",
  })

  useEffect(() => {
    setMedications(medicationsLS)
  }, [medicationsLS])

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPatient = filterPatient === "all" || med.patientId.toString() === filterPatient
    return matchesSearch && matchesPatient && med.isActive
  })

  const handleAddMedication = () => {
    const selectedPatient = patientsLS.find((p) => p.id.toString() === newMedication.patientId)
    const medication = {
      id: medications.length > 0 ? Math.max(...medications.map((m) => m.id)) + 1 : 1,
      ...newMedication,
      patientId: Number.parseInt(newMedication.patientId),
      patientName: selectedPatient?.name || "",
      isActive: true,
    }
    const updatedMedications = [...medications, medication]
    setMedicationsLS(updatedMedications)

    const logEntry = {
      id: logsLS.length > 0 ? Math.max(...logsLS.map((l) => l.id || 0)) + 1 : 1,
      medicationId: medication.id,
      patientId: medication.patientId,
      patientName: medication.patientName,
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      frequency: medication.frequency,
      route: medication.route,
      prescribedBy: medication.prescribedBy,
      date: new Date().toISOString().split('T')[0],
      status: 'added',
      notes: '',
    }
    setLogsLS([...logsLS, logEntry])

    setNewMedication({
      patientId: "",
      medicationName: "",
      dosage: "",
      frequency: "",
      route: "",
      startDate: "",
      endDate: "",
      prescribedBy: "",
      instructions: "",
      sideEffects: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleDiscontinue = (id: number) => {
    const updatedMedications = medications.map((med) => (med.id === id ? { ...med, isActive: false } : med))
    setMedicationsLS(updatedMedications)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Pill className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Medication Management</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Medications</h2>
            <p className="text-gray-600">Manage prescribed medications for all patients</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>Enter medication details for prescription</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Select onValueChange={(value) => setNewMedication({ ...newMedication, patientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsLS.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medicationName">Medication Name</Label>
                  <Input
                    id="medicationName"
                    value={newMedication.medicationName}
                    onChange={(e) => setNewMedication({ ...newMedication, medicationName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="route">Route</Label>
                  <Select onValueChange={(value) => setNewMedication({ ...newMedication, route: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Inhalation">Inhalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prescribedBy">Prescribed By</Label>
                  <Input
                    id="prescribedBy"
                    value={newMedication.prescribedBy}
                    onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newMedication.endDate}
                    onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newMedication.instructions}
                    onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="sideEffects">Side Effects</Label>
                  <Textarea
                    id="sideEffects"
                    value={newMedication.sideEffects}
                    onChange={(e) => setNewMedication({ ...newMedication, sideEffects: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedication}>Add Medication</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
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
          <Select value={filterPatient} onValueChange={setFilterPatient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patientsLS.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <Card key={medication.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-blue-600" />
                      {medication.medicationName}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {medication.patientName}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDiscontinue(medication.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Dosage:</span>
                    <Badge variant="secondary">{medication.dosage}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Frequency:</span>
                    <span className="text-sm text-gray-600">{medication.frequency}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Route:</span>
                    <span className="text-sm text-gray-600">{medication.route}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prescribed by:</span>
                    <span className="text-sm text-gray-600">{medication.prescribedBy}</span>
                  </div>

                  {medication.instructions && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Instructions:</p>
                      <p className="text-sm text-gray-600">{medication.instructions}</p>
                    </div>
                  )}

                  {medication.sideEffects && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Side Effects:</p>
                      <p className="text-sm text-red-600">{medication.sideEffects}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Start: {medication.startDate}</span>
                      <span>End: {medication.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={`/daily-log?medication=${medication.id}`}>
                    <Button className="w-full" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Log Medication
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new medication.</p>
          </div>
        )}
      </main>
    </div>
  )
}
