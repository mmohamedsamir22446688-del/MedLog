"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, User, Calendar, Phone, Mail, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import {useLocalStorage} from 'usehooks-ts'

const mockPatients: Patient[] = [
  
]

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


export default function PatientsPage() {
  const [patientsLS, setPatientsLS] = useLocalStorage<Patient[]>('patients', mockPatients)
  const [patients, setPatients] = useState<Patient[]>(patientsLS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    medicalConditions: "",
  })

  useEffect(() => {
    setPatients(patientsLS)
  }, [patientsLS])

  const filteredPatients = patients.filter(
    (patient: Patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPatient = () => {
    const patient = {
      id: patients.length > 0 ? Math.max(...patients.map((p: Patient) => p.id)) + 1 : 1,
      ...newPatient,
      age: Number.parseInt(newPatient.age),
      medicalConditions: newPatient.medicalConditions.split(",").map((c) => c.trim()),
      activeMedications: 0,
      lastVisit: new Date().toISOString().split("T")[0],
    }
    const updatedPatients = [...patients, patient]
    setPatientsLS(updatedPatients)
    setNewPatient({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      address: "",
      emergencyContact: "",
      medicalConditions: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleDeletePatient = (id: number) => {
    const updatedPatients = patients.filter((patient) => patient.id !== id)
    setPatientsLS(updatedPatients)
  }

  return (
    
    <div className="min-h-screen bg-gray-50">
     
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Patients</h2>
            <p className="text-gray-600">Manage patient information and medical records</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter patient information to create a new record</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={newPatient.emergencyContact}
                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
                  <Textarea
                    id="conditions"
                    value={newPatient.medicalConditions}
                    onChange={(e) => setNewPatient({ ...newPatient, medicalConditions: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPatient}>Add Patient</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>


        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient: Patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>
                      {patient.age} years old • {patient.gender}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePatient(patient.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last visit: {patient.lastVisit}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Medical Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      Active Medications: <span className="font-medium">{patient.activeMedications}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link href={`/patients/${patient.id}/medications`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Medications
                    </Button>
                  </Link>
                  <Link href={`/daily-log?patient=${patient.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Log Medication
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new patient.</p>
          </div>
        )}
      </main>
    </div>
  )
}
