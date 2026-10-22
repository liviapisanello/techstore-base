import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import RolarParaTopo from './components/RolarParaTopo'
import Loja from './pages/Loja'
import PaginaProduto from './pages/PaginaProduto'
import Carrinho from './pages/Carrinho'
import Estoque from './pages/Estoque'
import DashboardDono from './pages/DashboardDono'
import { buscarProdutos } from './services/produtos'
import { buscarClientes } from './services/clientes'

const STORAGE_KEY_ESPERA = 'techstore-espera'

function lerEsperando() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_ESPERA)
    return salvo ? JSON.parse(salvo) : []
  } catch {
    return []
  }
}

export default function App() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [carrinho, setCarrinho] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteAtualId, setClienteAtualId] = useState(null)
  const [esperando, setEsperando] = useState(lerEsperando)

  useEffect(() => {
    buscarProdutos()
      .then((dados) => setProdutos(dados))
      .catch(() => setErro('Não foi possível carregar os produtos.'))
      .finally(() => setCarregando(false))

    buscarClientes().then((dados) => {
      setClientes(dados)
      if (dados.length > 0) setClienteAtualId(dados[0].id)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ESPERA, JSON.stringify(esperando))
  }, [esperando])

  function adicionarAoCarrinho(produto) {
    setCarrinho(carrinho.concat(produto))
  }

  function removerUmaUnidade(produtoId) {
    // Remove só a primeira unidade encontrada do produto
    let removido = false
    setCarrinho(
      carrinho.filter((produto) => {
        if (!removido && produto.id === produtoId) {
          removido = true
          return false
        }
        return true
      })
    )
  }

  function registrarAvisoProduto(produtoId, nome, email) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        String(produto.id) === String(produtoId)
          ? { ...produto, estoque: Number(produto.estoque) + 1 }
          : produto
      )
    )

    const produtoAtual = produtos.find((produto) => String(produto.id) === String(produtoId))

    setEsperando((atual) => {
      const nomeFormatado = nome.trim()
      const emailFormatado = email.trim()
      const jaExiste = atual.some(
        (item) =>
          String(item.produtoId) === String(produtoId) &&
          item.email.toLowerCase() === emailFormatado.toLowerCase()
      )

      if (jaExiste) {
        return atual
      }

      return [
        ...atual,
        {
          produtoId: String(produtoId),
          produto: produtoAtual?.title ?? 'Produto',
          nome: nomeFormatado,
          email: emailFormatado,
          cadastradoEm: new Date().toISOString(),
        },
      ]
    })
  }

  const clienteAtual = clientes.find((cliente) => cliente.id === clienteAtualId)

  return (
    <div className="app">
      <RolarParaTopo />
      <Header carrinho={carrinho} clienteAtual={clienteAtual} />

      <main className="conteudo">
        {carregando && <p className="aviso">Carregando produtos...</p>}
        {erro && <p className="aviso aviso-erro">{erro}</p>}

        {!carregando && !erro && (
          <Routes>
            <Route
              path="/"
              element={<Loja produtos={produtos} onAdicionar={adicionarAoCarrinho} />}
            />
            <Route
              path="/produto/:id"
              element={
                <PaginaProduto
                  produtos={produtos}
                  onAdicionar={adicionarAoCarrinho}
                  onRegistrarAviso={registrarAvisoProduto}
                />
              }
            />
            <Route
              path="/carrinho"
              element={
                <Carrinho
                  carrinho={carrinho}
                  produtos={produtos}
                  clienteAtual={clienteAtual}
                  onAdicionar={adicionarAoCarrinho}
                  onRemover={removerUmaUnidade}
                />
              }
            />
            <Route path="/estoque" element={<Estoque produtos={produtos} esperando={esperando} />} />
            <Route
              path="/dono"
              element={<DashboardDono produtos={produtos} esperando={esperando} />}
            />
          </Routes>
        )}
      </main>

      <Footer
        clientes={clientes}
        clienteAtualId={clienteAtualId}
        onTrocarCliente={setClienteAtualId}
      />
    </div>
  )
}
