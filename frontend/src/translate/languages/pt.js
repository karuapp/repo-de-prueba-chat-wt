const messages = {
  pt: {
    translations: {
      signup: {
        title: 'Cadastre-se',
        toasts: {
          success: 'Usuário criado com sucesso! Faça seu login!!!.',
          fail: 'Erro ao criar usuário. Verifique os dados informados.',
        },
        form: {
          name: 'Nome',
          email: 'Email',
          password: 'Senha',
        },
        buttons: {
          submit: 'Cadastrar',
          login: 'Já tem uma conta? Entre!',
          terms: 'Concordo com os Termos de Uso',
          privacy: 'Concordo com a Política de Privacidade',
        },
      },
      login: {
        title: 'Login',
        form: {
          email: 'Email',
          password: 'Senha',
        },
        buttons: {
          submit: 'Entrar',
          register: 'Não tem uma conta? Cadastre-se!',
          forgotpassword: 'Recuperar Senha',
        },
      },
      companies: {
        title: 'Cadastrar Empresa',
        newtitle: 'Cadastro de Novo Cliente | Empresa',
        form: {
          name: 'Nome da Empresa',
          plan: 'Plano',
          token: 'Token',
          submit: 'Cadastrar',
          success: 'Empresa criada com sucesso!',
        },
      },
      auth: {
        toasts: {
          success: 'Login efetuado com sucesso!',
        },
        token: 'Token',
      },
      dashboard: {
        charts: {
          perDay: {
            title: 'Atendimentos hoje: ',
          },
        },
      },
      connections: {
        title: 'Conexões',
        toasts: {
          deleted: 'Conexão com o WhatsApp excluída com sucesso!',
        },
        confirmationModal: {
          deleteTitle: 'Deletar',
          deleteMessage: 'Você tem certeza? Essa ação não pode ser revertida.',
          disconnectTitle: 'Desconectar',
          disconnectMessage:
            'Tem certeza? Você precisará ler o QR Code novamente.',
        },
        buttons: {
          add: 'Adicionar WhatsApp',
          disconnect: 'desconectar',
          tryAgain: 'Tentar novamente',
          qrcode: 'QR CODE',
          newQr: 'Novo QR CODE',
          connecting: 'Conectando',
          restart: 'Reiniciar Conexões',
        },
        toolTips: {
          disconnected: {
            title: 'Falha ao iniciar sessão do WhatsApp',
            content:
              'Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code',
          },
          qrcode: {
            title: 'Esperando leitura do QR Code',
            content:
              "Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão",
          },
          connected: {
            title: 'Conexão estabelecida!',
          },
          timeout: {
            title: 'A conexão com o celular foi perdida',
            content:
              "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          id: 'ID',
          number: 'Número',
          channel: 'Canal',
          name: 'Nome',
          status: 'Status',
          lastUpdate: 'Última atualização',
          default: 'Padrão',
          actions: 'Ações',
          session: 'Sessão',
        },
      },
      whatsappModal: {
        title: {
          add: 'Adicionar WhatsApp',
          edit: 'Editar WhatsApp',
        },
        form: {
          name: 'Nome',
          default: 'Padrão',
        },
        buttons: {
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
        success: 'WhatsApp salvo com sucesso.',
      },
      qrCode: {
        message: 'Leia o QrCode para iniciar a sessão',
      },
      contacts: {
        title: 'Contatos',
        toasts: {
          deleted: 'Contato excluído com sucesso!',
        },
        searchPlaceholder: 'Pesquisar...',
        confirmationModal: {
          deleteTitle: 'Deletar ',
          importTitlte: 'Importar contatos',
          deleteMessage:
            'Tem certeza que deseja deletar este contato? Todos os atendimentos relacionados serão perdidos.',
          importMessage:
            'Esta ação irá importar os contatos salvos na agenda do WhatsApp. Alguns modelos podem não permitir essa funcionalidade ou de acordo com sua configuração de privacidade! Verifique em até 1 hora o resultado.',
        },
        buttons: {
          import: 'Importar Contatos',
          add: 'Adicionar Contato',
        },
        table: {
          name: 'Nome',
          whatsapp: 'Número WhatsApp',
          email: 'E-Mail',
          actions: 'Ações',
        },
      },
      Wallet: {
        title: 'Carteira',
        toasts: {
          remove: 'Contato removido da carteira com sucesso!',
        },
        searchPlaceholder: 'Pesquisar...',
        confirmationModal: {
          removeWalletContactTitle: 'Remover ',
          continueWalletTitle: 'da carteira',
          messages:{
            removeMessage: 'Você realmente deseja remover este contato de sua carteira?'
          }
        },
        table: {
          name: 'Nome',
          whatsapp: 'Número WhatsApp',
          email: 'E-Mail',
          actions: 'Ações',
        },
      },
      contactModal: {
        title: {
          add: 'Adicionar contato',
          edit: 'Editar contato',
        },
        form: {
          mainInfo: 'Dados do contato',
          extraInfo: 'Informações adicionais',
          name: 'Nome',
          number: 'Número do Whatsapp',
          email: 'Email',
          extraName: 'Nome do campo',
          extraValue: 'Valor',
        },
        buttons: {
          addExtraInfo: 'Adicionar informação',
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
        success: 'Contato salvo com sucesso.',
        error: 'Número não está no WhatsApp!',
      },
      queueModal: {
        title: {
          add: 'Adicionar fila',
          edit: 'Editar fila',
        },
        form: {
          name: 'Nome',
          color: 'Cor',
          greetingMessage: 'Mensagem de saudação',
          complationMessage: 'Mensagem de conclusão',
          outOfHoursMessage: 'Mensagem de fora de expediente',
          ratingMessage: 'Mensagem de avaliação',
          closeMessage: 'Mensagem de encerramento após inatividade',
          token: 'Token',
          webhook: 'Webhook',
          ignoreNumbers: 'Ignorar Números',
          isChatbot: 'ChatBot',
          prioridade: 'Ordenação do BOT',
          ativarRoteador: 'Rodízio de Atendentes',
          tempoRoteador: 'Tempo para Rodízio',
          resetChatbot: 'Pemitir reiniciar atendimento',
        },
        buttons: {
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
      },
      userModal: {
        title: {
          add: 'Adicionar usuário',
          edit: 'Editar usuário',
        },
        form: {
          name: 'Nome',
          email: 'Email',
          password: 'Senha',
          farewellMessage: 'Mensagem de Despedida',
          profile: 'Perfil',
          whatsapp: 'Conexão Padrão',
          SuperIs: 'DEFINIR SUPERUSER (Somente Admin)',
        },
        buttons: {
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
        success: 'Usuário salvo com sucesso.',
      },
      scheduleModal: {
        title: {
          add: 'Novo Agendamento',
          edit: 'Editar Agendamento',
        },
        form: {
          body: 'Mensagem',
          contact: 'Contato',
          sendAt: 'Data de Agendamento',
          sentAt: 'Data de Envio',
          geral: 'Abrir Ticket?',
        },
        buttons: {
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
        success: 'Agendamento salvo com sucesso.',
      },
      tagModal: {
        title: {
          add: 'Nova Tag',
          edit: 'Editar Tag',
        },
        form: {
          name: 'Nome',
          color: 'Cor',
          kanban: 'Kanban',
        },
        buttons: {
          okAdd: 'Adicionar',
          okEdit: 'Salvar',
          cancel: 'Cancelar',
        },
        success: 'Tag salvo com sucesso.',
      },
      chat: {
        noTicketMessage: 'Selecione um ticket para começar a conversar.',
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: 'ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO',
          titleFileList: 'Lista de arquivo(s)',
        },
      },
      ticketsManager: {
        buttons: {
          newTicket: 'Abrir Ticket',
        },
      },
      ticketsQueueSelect: {
        placeholder: 'Filas',
      },
      tickets: {
        toasts: {
          deleted: 'O atendimento que você estava foi deletado.',
        },
        notification: {
          message: 'Mensagem de',
        },
        tabs: {
          open: { title: 'Abertas' },
          openalone: { title: 'Atendimentos' },
          group: { title: 'Grupos' },
          closed: { title: 'Resolvidos' },
          search: { title: 'Busca' },
          groups: { title: 'Grupos' },
        },
        search: {
          placeholder: 'Buscar atendimento e mensagens',
          kanbanPlaceholder: 'Buscar atendimento',
          ticketsPerPage:'Tickets por página'
        },
        buttons: {
          showAll: 'Todos',
        },
      },
      reports:{
        title: 'Relatórios de Tickets',
        table:{
          id: 'Ticket',
          whatsapp: 'Conexão',
          contact:'Cliente',
          user:'Usuário',
          queue:'Fila',
          status:'Status',
          lastMessage:'Últ. Mensagem',
          dateOpen:'Data Abertura',
          dateClose:'Data Fechamento',
          actions:'Ação'
        },
        buttons:{
          filter: 'Aplicar Filtro'
        }
      },
      transferTicketModal: {
        title: 'Transferir Ticket',
        fieldLabel: 'Digite para buscar usuários',
        fieldQueueLabel: 'Transferir para fila',
        fieldQueuePlaceholder: 'Selecione uma fila',
        noOptions: 'Nenhum usuário encontrado com esse nome',
        buttons: {
          ok: 'Transferir',
          cancel: 'Cancelar',
        },
      },
      ticketsList: {
        pendingHeader: 'Aguardando',
        assignedHeader: 'Atendendo',
        noTicketsTitle: 'Nada aqui!',
        noTicketsMessage:
          'Nenhum atendimento encontrado com esse status ou termo pesquisado',
        buttons: {
          accept: 'Aceitar',
          closed: 'Finalizar',
          rejected: 'Rejeitar',
          reopen: 'Reabrir',
        },
      },
      newTicketModal: {
        title: 'Criar Ticket',
        fieldLabel: 'Digite para pesquisar o contato',
        add: 'Adicionar',
        buttons: {
          ok: 'Salvar',
          cancel: 'Cancelar',
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: 'Dashboard',
          connections: 'Conexões',
          tickets: 'Atendimento',
          quickMessages: 'Respostas Rápidas',
          contacts: 'Contatos',
          queues: 'Setores & Chatbot',
          tags: 'Tags',
          administration: 'Área Administrativa',
          users: 'Equipe',
          settings: 'Configurações',
          helps: 'Central de Ajuda',
          messagesAPI: 'API',
          schedules: 'Agendamentos',
          campaigns: 'Campanhas',
          campaignslists: 'Criar Listas',
          cpconfigs: 'Configurar Campanhas',
          annoucements: 'Anúncios',
          chats: 'Chat Interno',
          financeiro: 'Financeiro',
          kanban: 'Kanban',
          rating: 'Avaliações',
          ratings: 'Avaliações',
          oportunidades:'Oportunidades',
          wallet:'Carteira de Clientes'
        },
        appBar: {
          user: {
            profile: 'Perfil',
            logout: 'Sair',
          },
        },
      },
      ratingModal: {
        title: {
          add: 'Adicionar Avaliação',
          edit: 'Editar Avaliação',
        },
        buttons: {
          okAdd: 'Salvar',
          okEdit: 'Editar',
          cancel: 'Cancelar',
          options: 'Adicionar Opção',
        },
        form: {
          name: 'Nome',
          message: 'Mensagem da Avaliação',
          options: 'Opções de Avaliação',
          extraName: 'Qualificação',
          extraValue: 'Opção (Número)',
          geral: 'NPS Interno (Operador)',
        },
        success: 'Avaliação salva com sucesso!',
      },
      messagesAPI: {
        title: 'API',
        textMessage: {
          number: 'Número',
          body: 'Mensagem',
          token: 'Token cadastrado',
          openTicket: 'Abrir Ticket',
          queueId: 'ID da Fila',
        },
        mediaMessage: {
          number: 'Número',
          body: 'Nome do arquivo',
          media: 'Arquivo',
          token: 'Token cadastrado',
        },
      },
      notifications: {
        noTickets: 'Nenhuma notificação.',
      },
      quickMessages: {
        title: 'Respostas Rápidas',
        buttons: {
          add: 'Nova Resposta',
        },
        dialog: {
          add: 'Adicionar',
          edit: 'Editar',
          form: {
            shortcode: 'Atalho',
            message: 'Mensagem',
            geral: 'Global',
          },
        },
      },
      quickemessage: {
        toasts: {
          success: 'Atalho adicionado com sucesso!',
          deleted: 'Atalho removido com sucesso!',
        },
        title: 'Respostas Rápidas',
        buttons: {
          add: 'Nova Resposta',
        },
        dialog: {
          add: 'Adicionar',
          edit: 'Editar',
          form: {
            shortcode: 'Atalho',
            message: 'Mensagem',
            geral: 'Global',
          },
          buttons: {
            cancel: 'Cancelar',
            edit: 'Salvar',
            attach: 'Anexar',
            add: 'Salvar',
          },
        },
        confirmationModal: {
          deleteTitle: 'Exclusão',
          deleteMessage: 'Esta ação é irreversível! Deseja prosseguir?',
        },
      },
      contactLists: {
        title: 'Listas de Contatos',
        table: {
          name: 'Nome',
          contacts: 'Contatos',
          actions: 'Ações',
        },
        buttons: {
          add: 'Nova Lista',
        },
        dialog: {
          name: 'Nome',
          company: 'Empresa',
          okEdit: 'Editar',
          okAdd: 'Adicionar',
          add: 'Adicionar',
          edit: 'Editar',
          cancel: 'Cancelar',
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage: 'Esta ação não pode ser revertida.',
        },
        toasts: {
          deleted: 'Registro excluído',
        },
      },
      contactListItems: {
        title: 'Contatos',
        searchPlaceholder: 'Pesquisa',
        buttons: {
          add: 'Novo',
          lists: 'Listas',
          import: 'Importar',
        },
        dialog: {
          name: 'Nome',
          number: 'Número',
          whatsapp: 'Whatsapp',
          email: 'E-mail',
          okEdit: 'Editar',
          okAdd: 'Adicionar',
          add: 'Adicionar',
          edit: 'Editar',
          cancel: 'Cancelar',
        },
        table: {
          name: 'Nome',
          number: 'Número',
          whatsapp: 'Whatsapp',
          email: 'E-mail',
          actions: 'Ações',
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage: 'Esta ação não pode ser revertida.',
          importMessage: 'Deseja importar os contatos desta planilha? ',
          importTitlte: 'Importar',
        },
        toasts: {
          deleted: 'Registro excluído',
        },
      },
      campaigns: {
        title: 'Campanhas',
        searchPlaceholder: 'Pesquisa',
        buttons: {
          add: 'Nova Campanha',
          contactLists: 'Listas de Contatos',
        },
        table: {
          name: 'Nome',
          whatsapp: 'Conexão',
          contactList: 'Lista de Contatos',
          status: 'Status',
          scheduledAt: 'Agendamento',
          completedAt: 'Concluída',
          confirmation: 'Confirmação',
          actions: 'Ações',
        },
        dialog: {
          new: 'Nova Campanha',
          update: 'Editar Campanha',
          readonly: 'Apenas Visualização',
          form: {
            name: 'Nome',
            message1: 'Mensagem 1',
            message2: 'Mensagem 2',
            message3: 'Mensagem 3',
            message4: 'Mensagem 4',
            message5: 'Mensagem 5',
            confirmationMessage1: 'Mensagem de Confirmação 1',
            confirmationMessage2: 'Mensagem de Confirmação 2',
            confirmationMessage3: 'Mensagem de Confirmação 3',
            confirmationMessage4: 'Mensagem de Confirmação 4',
            confirmationMessage5: 'Mensagem de Confirmação 5',
            messagePlaceholder: 'Conteúdo da mensagem',
            whatsapp: 'Conexão',
            status: 'Status',
            scheduledAt: 'Agendamento',
            confirmation: 'Confirmação',
            contactList: 'Lista de Contato',
            tagList: 'Tags',
            groupList: 'Grupos',
          },
          buttons: {
            add: 'Adicionar',
            edit: 'Atualizar',
            okadd: 'Ok',
            cancel: 'Cancelar Disparos',
            restart: 'Reiniciar Disparos',
            close: 'Fechar',
            attach: 'Anexar Arquivo',
          },
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage: 'Esta ação não pode ser revertida.',
        },
        toasts: {
          success: 'Operação realizada com sucesso',
          cancel: 'Campanha cancelada',
          restart: 'Campanha reiniciada',
          deleted: 'Registro excluído',
        },
      },
      announcements: {
        title: 'Informativos',
        searchPlaceholder: 'Pesquisa',
        buttons: {
          add: 'Novo Informativo',
          contactLists: 'Listas de Informativos',
        },
        table: {
          priority: 'Prioridade',
          title: 'Title',
          text: 'Texto',
          mediaName: 'Arquivo',
          status: 'Status',
          actions: 'Ações',
        },
        dialog: {
          edit: 'Edição de Informativo',
          add: 'Novo Informativo',
          update: 'Editar Informativo',
          readonly: 'Apenas Visualização',
          form: {
            priority: 'Prioridade',
            title: 'Title',
            text: 'Texto',
            mediaPath: 'Arquivo',
            status: 'Status',
          },
          buttons: {
            add: 'Adicionar',
            edit: 'Atualizar',
            okadd: 'Ok',
            cancel: 'Cancelar',
            close: 'Fechar',
            attach: 'Anexar Arquivo',
          },
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage: 'Esta ação não pode ser revertida.',
        },
        toasts: {
          success: 'Operação realizada com sucesso',
          deleted: 'Registro excluído',
        },
      },
      campaignsConfig: {
        title: 'Configurações de Campanhas',
      },
      queues: {
        title: 'Filas & Chatbot',
        table: {
          id: 'ID',
          name: 'Nome',
          color: 'Cor',
          greeting: 'Mensagem de saudação',
          actions: 'Ações',
          prioridade: 'Ordem do Menu (BOT)',
        },
        buttons: {
          add: 'Adicionar fila',
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage:
            'Você tem certeza? Essa ação não pode ser revertida! Os atendimentos dessa fila continuarão existindo, mas não terão mais nenhuma fila atribuída.',
        },
      },
      queueSelect: {
        inputLabel: 'Filas',
        timeToMove: 'Após',
        moveQueue: 'Mover',
        timeToClose: 'Inatividade',
      },
      users: {
        title: 'Usuários',
        table: {
          id: 'ID',
          name: 'Nome',
          email: 'Email',
          profile: 'Perfil',
          whatsapp: 'Conexão Padrão',
          actions: 'Ações',
        },
        buttons: {
          add: 'Adicionar usuário',
        },
        toasts: {
          deleted: 'Usuário excluído com sucesso.',
        },
        confirmationModal: {
          deleteTitle: 'Excluir',
          deleteMessage:
            'Todos os dados do usuário serão perdidos. Os atendimento abertos deste usuário serão movidos para a fila.',
        },
      },
      helps: {
        title: 'Central de Ajuda',
      },
      schedules: {
        title: 'Agendamentos',
        confirmationModal: {
          deleteTitle: 'Você tem certeza que quer excluir este Agendamento?',
          deleteMessage: 'Esta ação não pode ser revertida.',
        },
        table: {
          contact: 'Contato',
          body: 'Mensagem',
          sendAt: 'Data de Agendamento',
          sentAt: 'Data de Envio',
          status: 'Status',
          actions: 'Ações',
          sentfrom: 'Enviada por',
          geral: 'Abrir Ticket?',
        },
        buttons: {
          add: 'Novo Agendamento',
        },
        toasts: {
          deleted: 'Agendamento excluído com sucesso.',
        },
      },
      tags: {
        title: 'Tags',
        confirmationModal: {
          deleteTitle: 'Você tem certeza que quer excluir esta Tag?',
          deleteMessage: 'Esta ação não pode ser revertida.',
        },
        table: {
          id: 'ID',
          name: 'Nome',
          color: 'Cor',
          tickets: 'Tickets Marcados',
          actions: 'Ações',
          kanban: 'Kanban',
        },
        buttons: {
          add: 'Nova Tag',
        },
        toasts: {
          deleted: 'Tag excluído com sucesso.',
        },
      },
      settings: {
        success: 'Configurações salvas com sucesso.',
        title: 'Configurações',
        settings: {
          userCreation: {
            name: 'Criação de usuário',
            options: {
              enabled: 'Ativado',
              disabled: 'Desativado',
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: 'Atribuído à:',
          dialogRatingTitle:
            'Deseja deixar uma avaliação de atendimento para o cliente?',
          dialogClosingTitle: 'Encerrando o atendimento!',
          dialogRatingCancel: 'Resolver com Mensagem de Encerramento',
          dialogRatingSuccess: 'Resolver e Enviar Avaliação',
          dialogRatingWithoutFarewellMsg:
            'Resolver sem Mensagem de Encerramento',
          ratingTitle: 'Escolha um menu de avaliação',
          buttons: {
            return: 'Retornar',
            resolve: 'Resolver',
            reopen: 'Reabrir',
            accept: 'Aceitar',
            rating: 'Enviar Avaliação',
          },
        },
      },
      messagesInput: {
        placeholderOpen: 'Digite uma mensagem',
        placeholderClosed:
          'Reabra ou aceite esse ticket para enviar uma mensagem.',
        signMessage: 'Assinar',
      },
      contactDrawer: {
        header: 'Dados do contato',
        buttons: {
          edit: 'Editar contato',
        },
        extraInfo: 'Outras informações',
      },
      ticketOptionsMenu: {
        schedule: 'Agendamento',
        delete: 'Deletar',
        transfer: 'Transferir',
        registerAppointment: 'Observações do Contato',
        resolveWithNoFarewell: 'Finalizar Sem Mensagem de Encerramento',
        acceptAudioMessage: 'Permitir Áudio?',
        appointmentsModal: {
          title: 'Observações do Contato',
          textarea: 'Observação',
          placeholder: 'Insira aqui a informação que deseja registrar',
        },
        confirmationModal: {
          title: 'Deletar o ticket do contato',
          message:
            'Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.',
        },
        buttons: {
          delete: 'Excluir',
          cancel: 'Cancelar',
        },
      },
      confirmationModal: {
        buttons: {
          confirm: 'Ok',
          cancel: 'Cancelar',
        },
      },
      forwardMessage: {
        text: "Encaminhada"
      },
      forwardMessageModal: {
        title: "Encaminhar mensagem",
        buttons: {
          ok: "Encaminhar"
        }
      },
      messageOptionsMenu: {
        delete: 'Deletar',
        reply: 'Responder',
        edit: 'Editar Mensagem',
        toForward:"Encaminhar",
        confirmationModal: {
          title: 'Apagar mensagem?',
          message: 'Esta ação não pode ser revertida.',
        },
      },
      quickemessages: {
        toasts: {
          success: 'Atalho adicionado com sucesso!',
          deleted: 'Atalho removido com sucesso!',
        },
        title: 'Respostas Rápidas',
        table: {
          shortcode: 'Atalho',
          mediaName: 'Arquivo',
          status: 'Global',
          actions: 'Ação',
        },
        searchPlaceholder: 'Procurar',
        buttons: {
          add: 'Adicionar',
          attach: 'Anexar Arquivo',
          cancel: 'Cancelar',
          edit: 'Salvar',
        },
        confirmationModal: {
          deleteTitle: 'Exclusão',
          deleteMessage: 'Esta ação é irreversível! Deseja prosseguir?',
        },
      },
      ratings: {
        title: 'Avaliações [NPS]',
        table: {
          name: 'Nome',
          contacts: 'Contatos',
          actions: 'Ação',
          geral: 'NPS Interno',
        },
        toasts: {
          deleted: 'Avaliação excluída com sucesso!',
          deletedAll: 'Todas as avaliações foram excluídas com sucesso!',
        },
        buttons: {
          add: 'Adicionar',
          deleteAll: 'Deletar Todos',
        },
        confirmationModal: {
          deleteTitle: 'Deletar ',
          deleteAllTitle: 'Deletar Todos',
          deleteMessage: 'Tem certeza que deseja deletar esta avaliação?',
          deleteAllMessage:
            'Tem certeza que deseja deletar todas as avaliações?',
        },
      },
      custom: {
        form: {
          mainColor: 'Cor Principal',
          scrollbarColor: 'Barra de Rolagem',
          toolbarBackground: 'Barra Superior',
          BackgroundPages: 'Background / Loading',
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: 'Deve haver pelo menos um WhatsApp padrão.',
        ERR_NO_DEF_WAPP_FOUND:
          'Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.',
        ERR_WAPP_NOT_INITIALIZED:
          'Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.',
        ERR_WAPP_CHECK_CONTACT:
          'Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões',
        ERR_WAPP_INVALID_CONTACT: 'Este não é um número de Whatsapp válido.',
        ERR_WAPP_DOWNLOAD_MEDIA:
          'Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.',
        ERR_INVALID_CREDENTIALS:
          'Erro de autenticação. Por favor, tente novamente.',
        ERR_SENDING_WAPP_MSG:
          'Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.',
        ERR_DELETE_WAPP_MSG: 'Não foi possível excluir a mensagem do WhatsApp.',
        ERR_OTHER_OPEN_TICKET: 'Já existe um ticket aberto para este contato.',
        ERR_SESSION_EXPIRED: 'Sessão expirada. Por favor entre.',
        ERR_USER_CREATION_DISABLED:
          'A criação do usuário foi desabilitada pelo administrador.',
        ERR_NO_PERMISSION: 'Você não tem permissão para acessar este recurso.',
        ERR_DUPLICATED_CONTACT: 'Já existe um contato com este número.',
        ERR_NO_SETTING_FOUND: 'Nenhuma configuração encontrada com este ID.',
        ERR_NO_CONTACT_FOUND: 'Nenhum contato encontrado com este ID.',
        ERR_NO_TICKET_FOUND: 'Nenhum ticket encontrado com este ID.',
        ERR_NO_USER_FOUND: 'Nenhum usuário encontrado com este ID.',
        ERR_NO_WAPP_FOUND: 'Nenhum WhatsApp encontrado com este ID.',
        ERR_CREATING_MESSAGE: 'Erro ao criar mensagem no banco de dados.',
        ERR_CREATING_TICKET: 'Erro ao criar ticket no banco de dados.',
        ERR_FETCH_WAPP_MSG:
          'Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.',
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          'Esta cor já está em uso, escolha outra.',
        ERR_WAPP_GREETING_REQUIRED:
          'A mensagem de saudação é obrigatório quando há mais de uma fila.',
      },
    },
  },
};

export { messages };
