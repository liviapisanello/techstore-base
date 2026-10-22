import { useState } from 'react'
import { Link, useParams } from 'react-router'

export default function PaginaProduto({ produtos, onAdicionar, onRegistrarAviso }) {
  const { id } = useParams()

  const produto = produtos.find((item) => String(item.id) === String(id))
  const [dadosAviso, setDadosAviso] = useState({ nome: '', email: '' })
  const [mensagemAviso, setMensagemAviso] = useState('')

  const precoFormatado = produto ? Number(produto.price).toFixed(2).replace('.', ',') : '0,00'

  function adicionarAoCarrinhoComAlerta() {
    onAdicionar(produto)
    window.alert(`${produto.title} foi adicionado ao carrinho.`)
  }

  function handleEnviarAviso(event) {
    event.preventDefault()

    const nome = dadosAviso.nome.trim()
    const email = dadosAviso.email.trim()

    if (!nome || !email) {
      setMensagemAviso('Preencha nome e e-mail para receber o aviso.')
      return
    }

    if (onRegistrarAviso) {
      onRegistrarAviso(produto.id, nome, email)
    }

    setMensagemAviso(`Tudo certo, ${nome}! Vamos te avisar em ${email} quando este produto voltar.`)
    setDadosAviso({ nome: '', email: '' })
  }

  if (!produto) {
    return (
      <div className="estado-vazio">
        <p>Produto não encontrado.</p>
        <Link to="/" className="botao botao-secundario">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const esgotado = produto.estoque === 0

  const relacionados = produtos
    .filter(
      (item) =>
        item.category === produto.category &&
        String(item.id) !== String(produto.id) &&
        item.estoque > 0
    )
    .slice(0, 4)

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.title}</span>
      </nav>


      <div className="detalhe">
        <div className="detalhe-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="detalhe-imagem" />
        </div>

        <div className="detalhe-info">
          <h1>{produto.title}</h1>
          <p className="card-avaliacao">
            ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
          </p>
          <p className="detalhe-preco">R$ {precoFormatado}</p>
          <p className="detalhe-descricao">{produto.description}</p>
          <p className="detalhe-estoque">
            {esgotado ? 'Produto esgotado no momento' : `${produto.estoque} unidades disponíveis`}
          </p>

          {esgotado && (
            <div className="alerta-esgotado">
              <p className="alerta-titulo">Produto esgotado</p>
              <form className="form-aviso" onSubmit={handleEnviarAviso}>
                <label className="campo-aviso">
                  <span>Nome</span>
                  <input
                    type="text"
                    value={dadosAviso.nome}
                    onChange={(event) =>
                      setDadosAviso((atual) => ({ ...atual, nome: event.target.value }))
                    }
                    placeholder="Seu nome"
                  />
                </label>

                <label className="campo-aviso">
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={dadosAviso.email}
                    onChange={(event) =>
                      setDadosAviso((atual) => ({ ...atual, email: event.target.value }))
                    }
                    placeholder="seu@email.com"
                  />
                </label>

                <button type="submit" className="botao botao-secundario botao-grande">
                  Avise-me quando voltar
                </button>
              </form>

              {mensagemAviso && <p className="mensagem-aviso">{mensagemAviso}</p>}
            </div>
          )}

          <button
            className="botao botao-grande"
            onClick={adicionarAoCarrinhoComAlerta}
            disabled={esgotado}
          >
            {esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
          </button>

          <ul className="detalhe-garantias">
            <li>Troca grátis em até 30 dias</li>
            <li>Parcele em até 10x sem juros</li>
          </ul>
        </div>
      </div>

      <h2>Produtos relacionados</h2>
      <div className="grade">
        {relacionados.map((item) => (
          <article key={item.id} className="card">
            <Link to={`/produto/${item.id}`} className="card-link">
              <div className="card-imagem-moldura">
                <img src={item.image} alt={item.title} className="card-imagem" />
              </div>
              <h3 className="card-titulo">{item.title}</h3>
            </Link>
            <p className="preco">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
            <button
              className="botao"
              onClick={() => {
                onAdicionar(item)
                window.alert(`${item.title} foi adicionado ao carrinho.`)
              }}
              disabled={item.estoque === 0}
            >
              {item.estoque === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
