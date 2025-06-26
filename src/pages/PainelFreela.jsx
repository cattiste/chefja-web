import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db } from '../firebase'
import AgendaFreela from '../components/AgendaFreela'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])
  const [freela, setFreela] = useState(null)
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const freelaLogado = usuarios.find(u => u.uid === usuario.uid)

    if (!freelaLogado) {
      alert('Freelancer não encontrado.')
      navigate('/login')
      return
    }

    setFreela(freelaLogado)

    const vagasDisponiveis = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasDisponiveis)

    // Escutar chamadas em tempo real
    const chamadasRef = collection(db, 'chamadas')
    const q = query(
      chamadasRef,
      where('freelaUid', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const chamada = { id: change.doc.id, ...change.doc.data() }
          alert(`📩 Você foi chamado pelo estabelecimento ${chamada.estabelecimentoNome}!`)
          tocarSomChamada()
          setChamadas(prev => [chamada, ...prev])
        }
        if (change.type === 'modified') {
          const chamadaModificada = { id: change.doc.id, ...change.doc.data() }
          setChamadas(prev => prev.map(c => c.id === chamadaModificada.id ? chamadaModificada : c))
        }
      })
    })

    return () => unsubscribe()
  }, [navigate])

  function tocarSomChamada() {
    const audio = new Audio('https://res.cloudinary.com/dbemvuau3/video/upload/v1750961914/qhkd3ojkqhi2imr9lup8.mp3')
    audio.play().catch((err) => {
      console.log('🔇 Som não pôde ser reproduzido automaticamente.', err)
    })
  }

  async function aceitarChamada(id) {
    try {
      const chamadaRef = doc(db, 'chamadas', id)
      await updateDoc(chamadaRef, { status: 'aceita' })
      alert('✅ Chamada aceita com sucesso!')
    } catch (error) {
      alert('Erro ao aceitar chamada.')
      console.error(error)
    }
  }

  async function recusarChamada(id) {
    try {
      const chamadaRef = doc(db, 'chamadas', id)
      await updateDoc(chamadaRef, { status: 'recusada' })
      alert('❌ Chamada recusada.')
    } catch (error) {
      alert('Erro ao recusar chamada.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
            🎯 Painel do Freelancer
          </h1>
          {freela && (
            <p className="text-gray-600 mt-2">
              Bem-vindo(a), <span className="font-semibold text-blue-600">{freela.nome}</span>
            </p>
          )}
        </div>

        {/* Perfil e Agenda */}
        {freela && (
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Perfil */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img
                  src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                  alt="freela"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{freela.nome}</h2>
                  <p className="text-blue-600">{freela.funcao}</p>
                  <p className="text-gray-500 text-sm">{freela.email}</p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-start">
                <button
                  onClick={() => navigate(`/editarfreela/${freela.uid}`)}
                  className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 px-5 rounded-full shadow-md"
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            </div>

            {/* Agenda */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                📅 Agenda de Disponibilidade
              </h2>
              <AgendaFreela uid={freela.uid} />
            </div>
          </div>
        )}

        {/* Vagas disponíveis */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
            📌 Vagas Disponíveis
          </h2>

          {vagas.length === 0 ? (
            <p className="text-gray-600 text-center">
              🔎 Nenhuma vaga disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map((vaga, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{vaga.titulo}</h3>
                  <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
                  <p><strong>📍 Cidade:</strong> {vaga.cidade}</p>
                  <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
                  <p><strong>💰 Salário:</strong> {vaga.salario}</p>
                  <p className="text-gray-600 mt-2 text-sm">{vaga.descricao}</p>

                  <a
                    href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
                    className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition"
                  >
                    ✅ Candidatar-se
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chamadas recentes */}
        <div className="max-w-3xl mx-auto mt-12 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📞 Chamadas Recentes</h2>
          {chamadas.length === 0 ? (
            <p>Nenhuma chamada recebida ainda.</p>
          ) : (
            chamadas.map((c, i) => (
              <div key={i} className="mb-5 border-b pb-4">
                <p>📩 Você foi chamado por: <strong>{c.estabelecimentoNome}</strong></p>
                <p>🕒 Em: {c.criadoEm?.toDate ? c.criadoEm.toDate().toLocaleString() : new Date(c.criadoEm).toLocaleString()}</p>
                <p className="mt-1">
                  🏷️ <strong>Status:</strong>{' '}
                  <span className={
                    c.status === 'aceita' ? 'text-green-600 font-semibold' :
                    c.status === 'recusada' ? 'text-red-600 font-semibold' :
                    'text-yellow-600 font-semibold'
                  }>
                    {c.status ? c.status.toUpperCase() : 'PENDENTE'}
                  </span>
                </p>

                {!c.status && (
                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => aceitarChamada(c.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-semibold"
                    >
                      ✅ Aceitar
                    </button>
                    <button
                      onClick={() => recusarChamada(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold"
                    >
                      ❌ Recusar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
