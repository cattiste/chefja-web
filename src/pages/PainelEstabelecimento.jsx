import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import BuscarFreelas from './BuscarFreelas'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'
import MinhasVagas from './MinhasVagas'

// Componente ChamadasEstabelecimento já com checkin/checkout
function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const chamadasRef = collection(db, 'chamadas')
    const q = query(chamadasRef, where('estabelecimentoUid', '==', estabelecimento.uid))

    setCarregando(true)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaChamadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(listaChamadas)
      setCarregando(false)
    }, (err) => {
      console.error('Erro ao carregar chamadas:', err)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  async function confirmarCheckIn(chamada) {
    if (!chamada.checkInFreela) {
      alert('O freelancer ainda não fez check-in.')
      return
    }
    if (chamada.checkInConfirmado) {
      alert('Check-in já confirmado.')
      return
    }
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)
      await updateDoc(chamadaRef, {
        checkInConfirmado: true,
        checkInConfirmadoHora: new Date()
      })
      alert('Check-in confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-in:', err)
      alert('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOut(chamada) {
    if (!chamada.checkOutFreela) {
      alert('O freelancer ainda não fez check-out.')
      return
    }
    if (chamada.checkOutConfirmado) {
      alert('Check-out já confirmado.')
      return
    }
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)
      await updateDoc(chamadaRef, {
        checkOutConfirmado: true,
        checkOutConfirmadoHora: new Date()
      })
      alert('Check-out confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-out:', err)
      alert('Erro ao confirmar check-out.')
    }
  }

  function statusColor(status) {
    switch (status) {
      case 'aceita':
        return 'text-green-600 font-semibold'
      case 'recusada':
        return 'text-red-600 font-semibold'
      case 'pendente':
      default:
        return 'text-yellow-600 font-semibold'
    }
  }

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return '—'
      if (timestamp.toDate) return timestamp.toDate().toLocaleString()
      if (timestamp instanceof Date) return timestamp.toLocaleString()
      if (typeof timestamp === 'number') return new Date(timestamp).toLocaleString()
      return String(timestamp)
    } catch {
      return '—'
    }
  }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando chamadas...
      </div>
    )
  }

  if (chamadas.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Você ainda não fez nenhuma chamada para freelancers.
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        📞 Minhas Chamadas
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-orange-300 rounded-lg shadow-sm">
          <thead className="bg-orange-100">
            <tr>
              <th className="border border-orange-300 px-4 py-2 text-left">Freelancer</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Data da Chamada</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Status</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-in Freela</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-in Confirmado</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Confirmar Check-in</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-out Freela</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-out Confirmado</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Confirmar Check-out</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map(chamada => (
              <tr key={chamada.id} className="hover:bg-orange-50">
                <td className="border border-orange-300 px-4 py-2">{chamada.freelaNome}</td>
                <td className="border border-orange-300 px-4 py-2">{formatDate(chamada.criadoEm)}</td>
                <td className={`border border-orange-300 px-4 py-2 ${statusColor(chamada.status || 'pendente')}`}>
                  {chamada.status ? chamada.status.charAt(0).toUpperCase() + chamada.status.slice(1) : 'Pendente'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkInFreela ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkInConfirmado ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  <button
                    disabled={chamada.checkInConfirmado || !chamada.checkInFreela}
                    onClick={() => confirmarCheckIn(chamada)}
                    className={`px-3 py-1 rounded text-white ${
                      chamada.checkInConfirmado || !chamada.checkInFreela
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkOutFreela ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkOutConfirmado ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  <button
                    disabled={chamada.checkOutConfirmado || !chamada.checkOutFreela}
                    onClick={() => confirmarCheckOut(chamada)}
                    className={`px-3 py-1 rounded text-white ${
                      chamada.checkOutConfirmado || !chamada.checkOutFreela
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('minhas-vagas')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const docRef = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(docRef)

          if (snap.exists() && snap.data().tipo === 'estabelecimento') {
            setEstabelecimento({ uid: user.uid, ...snap.data() })
          } else {
            console.warn('Usuário autenticado não é um estabelecimento.')
          }
        } catch (err) {
          console.error('Erro ao buscar dados do estabelecimento:', err)
        }
      } else {
        console.warn('Nenhum usuário autenticado.')
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  function abrirEdicao(vaga) {
    setVagaEditando(vaga)
    setAba('publicar')
  }

  function onSalvarSucesso() {
    setVagaEditando(null)
    setAba('minhas-vagas')
  }
