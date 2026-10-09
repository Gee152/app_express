# language: pt
Funcionalidade: Gestão Multi-Tenant de Lojas pelo Super Administrador
  Como Super Administrador do Catálogo Express
  Eu quero criar, selecionar, visualizar credenciais e gerenciar múltiplas lojas em um só lugar
  Para administrar todo o ecossistema de catálogos

  Contexto:
    Dado que o Super Admin está autenticado no painel de gerenciamento em "/"

  Cenário: Criação de nova loja diretamente pelo card integrado no grid
    Quando o Super Admin preenche o nome da loja "TechFix Suporte" no card "+ Nova Loja"
    E seleciona o nicho "Assistência Técnica & Informática"
    E clica no botão "Criar Loja"
    Então uma nova loja deve ser criada com o slug "techfix-suporte"
    E a loja deve ser criada com status "Publicada" e "Liberada" por padrão
    E o sistema deve gerar credenciais automáticas de login "techfix-suporte@loja.com" com senha "123456"
    E a nova loja deve ser exibida no grid de lojas

  Cenário: Seleção interativa de loja com destaque visual da borda
    Dado que existem as lojas "Loja Alpha" e "Loja Beta" no grid
    Quando o Super Admin clica no card da "Loja Beta"
    Então a "Loja Beta" deve se tornar a loja ativa no contexto
    E o card da "Loja Beta" deve receber a borda de destaque ativa com o badge "✓ Ativa"
    E o banner de links rápidos no topo deve sincronizar com o link da "Loja Beta"

  Cenário: Visualização e cópia segura de credenciais com o botão olhinho
    Dado que existe uma loja cadastrada com senha "123456"
    Quando o card da loja é exibido inicialmente
    Então a senha do dono deve estar mascarada como "••••••••"
    Quando o Super Admin clica no ícone de olhinho (Eye)
    Então a senha real "123456" deve ser revelada no card
    Quando o Super Admin clica novamente no ícone de olhinho (EyeOff)
    Então a senha deve voltar a ser mascarada como "••••••••"

  Cenário: Compartilhamento do link de acesso para o cliente
    Dado que uma loja está selecionada no grid
    Quando o Super Admin clica no botão "Link Login para o Cliente"
    Então o link de acesso com o parâmetro "?acesso=dono&loja=slug" deve ser copiado para a área de transferência
    E o botão deve exibir o feedback "Link Login Cliente Copiado!"
