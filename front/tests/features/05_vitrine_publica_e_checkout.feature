# language: pt
Funcionalidade: Experiência do Cliente na Vitrine Pública e Pedido via WhatsApp
  Como cliente final acessando o catálogo digital
  Eu quero visualizar os produtos, conferir a localização física da loja e montar meu pedido
  Para enviar meu pedido diretamente ao WhatsApp do estabelecimento

  Contexto:
    Dado que o cliente acessa a vitrine pública através da URL "?loja=techfix-suporte"

  Cenário: Visualização de Headline personalizada e Localização no Banner
    Então a vitrine deve exibir o nome da loja "TechFix Suporte" no banner principal
    E deve exibir o endereço formatado no badge com link direto para o Google Maps
    E deve exibir a headline personalizada no topo dos produtos

  Cenário: Visualização do Bloco de Espaço Físico com Mapa Interativo
    Quando o cliente navega na página inicial (Home) da vitrine
    Então o card "Nosso Espaço Físico & Localização" deve ser exibido
    E deve exibir o endereço completo, ponto de referência e horário de funcionamento
    E deve disponibilizar os botões "Abrir no Google Maps" e "Waze"
    E deve renderizar o iframe interativo do mapa

  Cenário: Detalhe do Produto e Compra em Marketplace
    Dado que existe um produto com link da Shopee
    Quando o cliente clica no card do produto
    Então o modal de detalhes do produto deve ser aberto
    E deve exibir o botão estilizado com o badge oficial "Comprar na Shopee Oficial"

  Cenário: Adição ao Carrinho e Finalização de Pedido via WhatsApp
    Quando o cliente clica no botão "+ Pedir" de um produto de R$ 50,00
    Então o contador do carrinho deve ser atualizado para "1"
    Quando o cliente abre o Drawer do Carrinho
    E informa seu nome "Carlos Silva", endereço "Rua 10, Casa 5" e forma de pagamento "PIX"
    E clica no botão "Enviar Pedido para o WhatsApp"
    Então o sistema deve formatar a mensagem com a lista de itens, adicionais, total e dados do cliente
    E deve gerar o link "https://wa.me/55..." para abertura do WhatsApp
