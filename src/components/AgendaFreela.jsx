// src/components/AgendaFreela.jsx
import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function AgendaFreela({ uid }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])

  useEffect(() => {
    async function carregarAgenda() {
      try {
        const docRef = doc(db, 'agendas', uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setDatasOcupadas(docSnap.data().ocupado || [])
        }
      } catch (error) {
        console.error('Erro ao carregar agenda:', error)
      }
    }

    carregarAgenda()
  }, [uid])

  const toggleData = async (date) => {
    const dataISO = date.toISOString().split('T')[0]

    const novaAgenda = datasOcupadas.includes(dataISO)
      ? datasOcupadas.filter(d => d !== dataISO)
      : [...datasOcupadas, dataISO]

    setDatasOcupadas(novaAgenda)

    // Salvar no Firestore
    try {
      await setDoc(doc(db, 'agendas', uid), { ocupado: novaAgenda })
    } catch (error) {
      console.error('Erro ao salvar agenda:', error)
    }
  }

  const tileClassName = ({ date }) => {
    const dataISO = date.toISOString().split('T')[0]
    return datasOcupadas.includes(dataISO) ? 'bg-red-200' : ''
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📅 Agenda de Disponibilidade</h2>
      <p className="text-gray-600 mb-2 text-sm">Clique nos dias para marcar como ocupado ou disponível.</p>
      <Calendar
        onClickDay={toggleData}
        tileClassName={tileClassName}
      />
    </div>
  )
}
