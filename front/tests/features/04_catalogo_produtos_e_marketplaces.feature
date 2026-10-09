# language: pt
Funcionalidade: Gestão de Produtos, Categorias e Links de Marketplaces
  Como Dono da Loja
  Eu quero cadastrar e editar produtos, categorias e links de compra externa
  Para exibir meus produtos com clareza e permitir compras diretas ou por marketplaces

  Contexto:
    Dado que o usuário está no Painel Administrativo da Loja na aba "Produtos"

  Cenário: Cadastro de produto com link de compra externo (Shopee / Mercado Livre)
    Quando o usuário clica no botão "Novo Produto"
    E preenche o nome do produto "Smartwatch Ultra Pro"
    E preenche o preço "199.90"
    E seleciona a categoria "Acessórios"
    E preenche o campo "Link Externo de Compra" com "https://shopee.com.br/product/12345/67890"
    E clica no botão "Salvar Produto"
    Então o produto "Smartwatch Ultra Pro" deve ser listado na tabela de produtos
    E deve conter a identificação de marketplace associado

  Cenário: Gerenciamento e ordenação de categorias
    Dado que o usuário acessa a aba "Categorias"
    Quando o usuário adiciona a nova categoria "Smartphones & Tablets"
    Então a nova categoria deve ser criada e disponibilizada no seletor de produtos e no filtro da vitrine
