// src/pages/PublicarVaga.jsx
import React, { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarVaga({ estabelecimento, vaga = null, onSucesso }) {
  const [tipoVaga, setTipoVaga] = useState('clt')
  const [titulo, setTitulo] = useState('')
  const [funcao, setFuncao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [empresa, setEmpresa] = useState(estabelecimento?.nome || '')
  const [emailContato, setEmailContato] = useState(estabelecimento?.email || '')
  const [cidade, setCidade] = useState('')
  const [salario, setSalario] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [datasAgendadas, setDatasAgendadas] = useState([])
  const [urgente, setUrgente] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vaga) {
      setTipoVaga(vaga.tipoVaga || 'clt')
      setTitulo(vaga.titulo || '')
      setFuncao(vaga.funcao || '')
      setDescricao(vaga.descricao || '')
      setEmpresa(vaga.empresa || estabelecimento?.nome || '')
      setEmailContato(vaga.emailContato || estabelecimento?.email || '')
      setCidade(vaga.cidade || '')
      setSalario(vaga.salario ?? '')
      setValorDiaria(vaga.valorDiaria ?? '')
      setDatasAgendadas(
        vaga.datasAgendadas
          ? vaga.datasAgendadas.map(d =>
              d.seconds ? new Date(d.seconds * 1000).toISOString().substring(0, 10) : d
            )
          : []
      )
      setUrgente(vaga.urgente || false)
    }
  }, [vaga, estabelecimento])

  function toggleData(data) {
    if (datasAgendadas.includes(data)) {
      setDatasAgendadas(datasAgendadas.filter(d => d !== data))
    } else {
      setDatasAgendadas([...datasAgendadas, data])
    }
  }

  const opcoesDatas = ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04']

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!titulo || !funcao || !descricao || !empresa || !emailContato || !cidade) {
        throw new Error('Preencha todos os campos obrigatórios.')
      }

      if (tipoVaga === 'clt' && (!salario || Number(salario) <= 0)) {
        throw new Error('Informe um salário válido para vaga CLT.')
      }

      if (tipoVaga === 'freela' && (!valorDiaria || Number(valorDiaria) <= 0)) {
        throw new Error('Informe um valor de diária válido para vaga Freela.')
      }

      if (tipoVaga === 'freela' && datasAgendadas.length === 0) {
        throw new Error('Selecione pelo menos uma data para vaga Freela.')
      }

      const dadosParaSalvar = {
        titulo,
        funcao,
        descricao,
        empresa,
        emailContato,
        cidade,
        tipoVaga,
        salario: tipoVaga === 'clt' ? Number(salario) : null,
        valorDiaria: tipoVaga === 'freela' ? Number(valorDiaria) : null,
        datasAgendadas: tipoVaga === 'freela' ? datasAgendadas.map(d => new Date(d)) : [],
        urgente,
        status: 'ativo',
        dataPublicacao: serverTimestamp(),
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
      }

      if (vaga?.id) {
        const vagaRef = doc(db, 'vagas', vaga.id)
        await updateDoc(vagaRef, dadosParaSalvar)
      } else {
        await addDoc(collection(db, 'vagas'), dadosParaSalvar)
      }

      if (onSucesso) onSucesso()
    } catch (err) {
      setError(err.message || 'Erro ao salvar vaga.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">
        {vaga ? '✏️ Editar Vaga' : '📢 Publicar Nova Vaga'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <label className="block font-semibold text-orange-700">
          Tipo de Vaga:
          <select
            value={tipoVaga}
            onChange={e => setTipoVaga(e.target.value)}
            className="input-field mt-1 w-full rounded border px-3 py-2"
          >
            <option value="clt">CLT (Fixa)</option>
            <option value="freela">Freela (Diária)</option>
          </select>
        </label>

        {/* Título, Função, Descrição */}
        <input required value={titulo} onChange={e => setTitulo(e.target.value)} className="input-field w-full" placeholder="Título da vaga" />
        <input required value={funcao} onChange={e => setFuncao(e.target.value)} className="input-field w-full" placeholder="Função" />
        <textarea required value={descricao} onChange={e => setDescricao(e.target.value)} className="input-field w-full" placeholder="Descrição" rows={4} />

        {/* Empresa e Contato */}
        <input required value={empresa} onChange={e => setEmpresa(e.target.value)} className="input-field w-full" placeholder="Empresa" />
        <input required type="email" value={emailContato} onChange={e => setEmailContato(e.target.value)} className="input-field w-full" placeholder="E-mail de contato" />

        <input required value={cidade} onChange={e => setCidade(e.target.value)} className="input-field w-full" placeholder="Cidade" />

        {/* Salário ou Diária */}
        {tipoVaga === 'clt' && (
          <input required value={salario} onChange={e => setSalario(e.target.value)} className="input-field w-full" placeholder="Salário (R$)" type="number" />
        )}
        {tipoVaga === 'freela' && (
          <>
            <input required value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className="input-field w-full" placeholder="Valor da Diária (R$)" type="number" />
            <fieldset className="border border-gray-300 rounded p-3 mt-4">
              <legend className="font-semibold text-orange-700 mb-2">Datas Agendadas:</legend>
              <div className="flex flex-wrap gap-3">
                {opcoesDatas.map(data => (
                  <label key={data} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={datasAgendadas.includes(data)} onChange={() => toggleData(data)} />
                    <span>{data}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {/* Urgente */}
        <label className="flex items-center space-x-2 mt-4">
          <input type="checkbox" checked={urgente} onChange={() => setUrgente(!urgente)} />
          <span className="font-semibold text-orange-700">Vaga Urgente</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? (vaga ? 'Atualizando...' : 'Publicando...') : vaga ? 'Atualizar Vaga' : 'Publicar Vaga'}
        </button>
      </form>
    </div>
  )
}
