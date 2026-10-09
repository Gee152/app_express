# language: pt
Funcionalidade: Autenticação, Controle de Acesso e Segurança de Credenciais
  Como usuário do sistema Catálogo Express (Super Admin ou Dono da Loja)
  Eu quero realizar login unificado e gerenciar minhas credenciais com segurança
  Para acessar o painel correspondente ao meu nível de permissão

  Contexto:
    Dado que o usuário acessa a página inicial do sistema em "/"

  Cenário: Login bem-sucedido como Super Admin (Root)
    Quando o usuário informa o e-mail "gabrielvictos152@gmail.com"
    E informa a senha "123456789"
    E clica no botão "Acessar Sistema"
    Então o sistema deve autenticar o usuário como Super Administrador
    E deve redirecionar para a tela de gerenciamento de lojas do Super Admin
    E deve exibir o painel com as opções de ecossistema e grid de lojas

  Cenário: Login bem-sucedido como Dono de Loja
    Dado que existe uma loja cadastrada com login "burguer-recife@loja.com" e senha "123456"
    Quando o usuário informa o e-mail "burguer-recife@loja.com"
    E informa a senha "123456"
    E clica no botão "Acessar Sistema"
    Então o sistema deve autenticar o usuário como Dono da Loja
    E deve carregar o contexto da loja "burguer-recife"
    E deve redirecionar diretamente para o Dashboard Administrativo da Loja

  Cenário: Tentativa de login com credenciais incorretas
    Quando o usuário informa o e-mail "usuario_invalido@teste.com"
    E informa a senha "senha_errada"
    E clica no botão "Acessar Sistema"
    Então o sistema deve bloquear o acesso
    E deve exibir uma mensagem de erro indicando credenciais inválidas

  Cenário: Troca segura de senha do Dono da Loja com validação de senha antiga
    Dado que o Dono da Loja está autenticado no painel da loja
    E acessa a aba "Perfil da Empresa"
    Quando o usuário clica no campo protegido de senha de acesso
    Então o modal "Alterar Senha de Acesso" deve ser exibido
    Quando o usuário informa uma senha atual incorreta "senha_errada"
    E informa a nova senha "nova1234" e confirmação "nova1234"
    E clica em "Verificar e Alterar"
    Então o sistema deve exibir a mensagem de erro "A senha atual informada está incorreta"
    Quando o usuário informa a senha atual correta "123456"
    E informa a nova senha "nova1234" e confirmação "nova1234"
    E clica em "Verificar e Alterar"
    Então a nova senha deve ser salva com sucesso no banco de dados local
    E o modal deve ser fechado com feedback de sucesso
