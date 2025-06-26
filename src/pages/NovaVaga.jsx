import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NovaVaga() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [requisitos, setRequisitos] = useState('')
  const [local, setLocal] = useState('')

  const handleCriarVaga = () => {
    if (!titulo || !descricao || !local) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'estabelecimento') {
      alert('Apenas estabelecimentos podem criar vagas.')
      return
    }

    const novaVaga = {
      id: Date.now(),
      titulo,
      descricao,
      requisitos,
      local,
      estabelecimento: usuario.nome,
      candidatos: []
    }

    const vagas = JSON.parse(localStorage.getItem('vagas') || '[]')
    vagas.push(novaVaga)
    localStorage.setItem('vagas', JSON.stringify(vagas))

    alert('Vaga criada com sucesso!')
    navigate('/painel')
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">📢 Criar Nova Vaga</h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Título da vaga"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <textarea
          placeholder="Descrição da vaga"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
          required
        />
        <input
          type="text"
          placeholder="Requisitos (opcional)"
          value={requisitos}
          onChange={(e) => setRequisitos(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="text"
          placeholder="Local da vaga"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <button
          onClick={handleCriarVaga}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-semibold transition"
        >
          Criar Vaga
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/painel')}
          className="text-gray-600 underline hover:text-gray-800"
        >
          Voltar ao Painel
        </button>
      </div>
    </div>
  )
}
