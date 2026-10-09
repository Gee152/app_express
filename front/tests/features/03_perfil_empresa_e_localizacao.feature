# language: pt
Funcionalidade: Personalização da Empresa, Headline e Espaço Físico com Google Maps
  Como Dono da Loja
  Eu quero customizar os dados da minha empresa, títulos da vitrine e localização do espaço físico
  Para que meus clientes encontrem meu estabelecimento e tenham uma experiência personalizada

  Contexto:
    Dado que o usuário está no Painel Administrativo da Loja na aba "Perfil da Empresa"

  Cenário: Configuração de Título e Subtítulo de Boas-Vindas da Vitrine (Headline)
    Quando o usuário acessa a seção "Mensagem de Boas-Vindas da Vitrine (Headline)"
    E clica no botão "Sugerir para [Nicho]"
    Então o campo "Título Principal" deve ser preenchido com a sugestão específica do nicho
    E o campo "Subtítulo Explicativo" deve ser preenchido com a sugestão do nicho
    Quando o usuário edita o título para "Tecnologia de Ponta para Você! ⚡"
    E clica no botão "Salvar Alterações"
    Então o novo título customizado deve ser salvo e refletido na vitrine pública

  Cenário: Ativação de Espaço Físico com Endereço e Integração Google Maps
    Quando o usuário ativa o toggle "Espaço Físico & Localização"
    E preenche o endereço "Av. Boa Viagem", número "1500", bairro "Boa Viagem", cidade "Recife - PE"
    E preenche o ponto de referência "Em frente à pracinha"
    E clica no botão "⚡ Gerar link a partir do endereço"
    Então o link do Google Maps deve ser gerado automaticamente no campo de URL
    E o iframe de prévia do Google Maps deve ser carregado com o endereço informado
    Quando o usuário clica em "Salvar Alterações"
    Então os dados de localização e mapa devem ser salvos para exibição na vitrine pública
