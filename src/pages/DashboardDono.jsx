function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor)
}

export default function DashboardDono({ produtos = [], esperando = [] }) {
    const categorias = ['roupas', 'eletronicos', 'acessorios', 'casa']

    const resumoPorCategoria = categorias.map((categoria) => {
        const itensCategoria = produtos.filter((produto) => produto.category === categoria)

        const valorEmEstoque = itensCategoria.reduce(
            (total, produto) => total + Number(produto.price || 0) * Number(produto.estoque || 0),
            0
        )

        const itensEspera = itensCategoria.filter((produto) => Number(produto.estoque || 0) < 5).length

        const clientesEsperando = esperando.filter((item) => {
            const produto = itensCategoria.find(
                (produtoAtual) => String(produtoAtual.id) === String(item.produtoId)
            )
            return Boolean(produto)
        }).length

        const lucroEstimado = valorEmEstoque * 0.35

        return {
            categoria,
            valorEmEstoque,
            itensEspera,
            clientesEsperando,
            lucroEstimado,
        }
    })

    const totalEstoque = resumoPorCategoria.reduce((total, item) => total + item.valorEmEstoque, 0)
    const totalEsperaReposicao = resumoPorCategoria.reduce((total, item) => total + item.itensEspera, 0)
    const totalClientesEsperando = esperando.length
    const totalLucroEstimado = resumoPorCategoria.reduce((total, item) => total + item.lucroEstimado, 0)

    return (
        <section>
            <p className="sobretitulo">Painel do dono</p>
            <h1>Dashboard da loja</h1>

            <div className="dashboard-resumo">
                <article className="card dashboard-card">
                    <p className="dashboard-label">Valor em estoque</p>
                    <strong>{formatarMoeda(totalEstoque)}</strong>
                </article>

                <article className="card dashboard-card">
                    <p className="dashboard-label">Itens esperando reposição</p>
                    <strong>{totalEsperaReposicao}</strong>
                </article>

                <article className="card dashboard-card">
                    <p className="dashboard-label">Clientes esperando retorno</p>
                    <strong>{totalClientesEsperando}</strong>
                </article>

                <article className="card dashboard-card">
                    <p className="dashboard-label">Lucro bruto estimado</p>
                    <strong>{formatarMoeda(totalLucroEstimado)}</strong>
                </article>
            </div>

            <div className="tabela-moldura dashboard-tabela">
                <table className="tabela">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Valor em estoque</th>
                            <th>Esperando reposição</th>
                            <th>Clientes esperando</th>
                            <th>Lucro estimado</th>
                        </tr>
                    </thead>

                    <tbody>
                        {resumoPorCategoria.map((item) => (
                            <tr key={item.categoria}>
                                <td>{item.categoria}</td>
                                <td>{formatarMoeda(item.valorEmEstoque)}</td>
                                <td>{item.itensEspera}</td>
                                <td>{item.clientesEsperando}</td>
                                <td>{formatarMoeda(item.lucroEstimado)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="aviso dashboard-nota">
                Cálculo de lucro estimado com margem bruta média de 35% sobre o valor em estoque.
            </p>
        </section>
    )
}
