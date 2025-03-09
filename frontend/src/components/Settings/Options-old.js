import React, { useEffect, useState } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Title from "../Title";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { Tabs, Tab } from "@material-ui/core";

//import 'react-toastify/dist/ReactToastify.css';
 
const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  tab: {
    background: "#f2f5f3",
    borderRadius: 4,
    width: "100%",
    "& .MuiTab-wrapper": {
      color: "#128c7e"
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    }


  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [callType, setCallType] = useState("enabled");
  const [outsideMessageType, setOutsideMessageType] = useState("disabled");
  const [outsideQueueType, setOutsideQueueType] = useState("disabled");
  const [chatbotType, setChatbotType] = useState("");

  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingOutsideMessageType, setLoadingOutsideMessageType] = useState(false);
  const [loadingOutsideQueueType, setLoadingOutsideQueueType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);
  const [loadingCheckMsgIsGroup, setCheckMsgIsGroup] = useState(false);

  const [idfilaType, setIdFilaType] = useState("");
  const [loadingIdFilaType, setLoadingIdFilaType] = useState(false);
  
  const [tempofilaType, setTempoFilaType] = useState("5");
  const [loadingTempoFilaType, setLoadingTempoFilaType] = useState(false);
  

  const [mainColor, setMainColorType] = useState("#000000");
  const [loadingMainColorType, setLoadingMainColorType] = useState(false);

  const [scrollbarColor, setScrollbarColorType] = useState("#000000");
  const [loadingScrollbarColorType, setLoadingScrollbarColorType] = useState(false);

  const [toolbarBackground, setToolbarBackgroundType] = useState("#000000");
  const [loadingToolbarBackgroundType, setLoadingToolbarBackgroundType] = useState(false);
  
  //const [tokenixcType, setTokenIxcType] = useState("");
  //const [loadingTokenIxcType, setLoadingTokenIxcType] = useState(false);

  //const [ipmkauthType, setIpMkauthType] = useState("");
  //const [loadingIpMkauthType, setLoadingIpMkauthType] = useState(false);
  //const [clientidmkauthType, setClientIdMkauthType] = useState("");
  //const [loadingClientIdMkauthType, setLoadingClientIdMkauthType] = useState(false);
  //const [clientsecretmkauthType, setClientSecrectMkauthType] = useState("");
  //const [loadingClientSecrectMkauthType, setLoadingClientSecrectMkauthType] = useState(false);

  //const [asaasType, setAsaasType] = useState("");
  //const [loadingAsaasType, setLoadingAsaasType] = useState(false);

  // ADICIONAIS
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);
  

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }
      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }
      const callType = settings.find((s) => s.key === "call");
      if (callType) {
        setCallType(callType.value);
      }
    
      const outsideMessageType = settings.find((s) => s.key === "outsidemessage");
      if (outsideMessageType) {
        setOutsideMessageType(outsideMessageType.value);
      }
    
      const outsideQueueType = settings.find((s) => s.key === "outsidequeue");
      if (outsideQueueType) {
        setOutsideQueueType(outsideQueueType.value);
      }
    
      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }
      const chatbotType = settings.find((s) => s.key === "chatBotType");
      if (chatbotType) {
        setChatbotType(chatbotType.value);
      }

      const tempofilaType = settings.find((s) => s.key === "tempofila");
      if (tempofilaType) {
        setTempoFilaType(tempofilaType.value);
      }

      const idfilaType = settings.find((s) => s.key === "idfila");
      if (idfilaType) {
        setIdFilaType(idfilaType.value);
      }

      const mainColor = settings.find((s) => s.key === "mainColor");
      if (mainColor) {
        setMainColorType(mainColor.value);
      }

      const scrollbarColor = settings.find((s) => s.key === "scrollbarColor");
      if (scrollbarColor) {
        setScrollbarColorType(scrollbarColor.value);
      }

      const toolbarBackground = settings.find((s) => s.key === "toolbarBackground");
      if (toolbarBackground) {
        setToolbarBackgroundType(toolbarBackground.value);
      }

      /*
      const ipixcType = settings.find((s) => s.key === "ipixc");
      if (ipixcType) {
        setIpIxcType(ipixcType.value);
      }

      const tokenixcType = settings.find((s) => s.key === "tokenixc");
      if (tokenixcType) {
        setTokenIxcType(tokenixcType.value);
      }      

      const ipmkauthType = settings.find((s) => s.key === "ipmkauth");
      if (ipmkauthType) {
        setIpMkauthType(ipmkauthType.value);
      }

      const clientidmkauthType = settings.find((s) => s.key === "clientidmkauth");
      if (clientidmkauthType) {
        setClientIdMkauthType(clientidmkauthType.value);
      }

      const clientsecretmkauthType = settings.find((s) => s.key === "clientsecretmkauth");
      if (clientsecretmkauthType) {
        setClientSecrectMkauthType(clientsecretmkauthType.value);
      }

      const asaasType = settings.find((s) => s.key === "asaas");
      if (asaasType) {
        setAsaasType(asaasType.value);
      }
      */
    
      const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    //toast.success("Oraçãpeo atualizada com sucesso.");
    toast.success('Operação atualizada com sucesso.', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "light",
      });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({
      key: "call",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCallType(false);
  }

  async function handleOutsideMessageType(value) {
    setOutsideMessageType(value);
    setLoadingOutsideMessageType(true);
    await update({
      key: "outsidemessage",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingOutsideMessageType(false);
  }

  async function handleOutsideQueueType(value) {
    setOutsideQueueType(value);
    setLoadingOutsideQueueType(true);
    await update({
      key: "outsidequeue",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingOutsideQueueType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({
      key: "chatBotType",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    setCheckMsgIsGroup(true);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setCheckMsgIsGroup(false);
    /*     if (typeof scheduleTypeChanged === "function") {
          scheduleTypeChanged(value);
        } */
  }

  async function handleChangeTempoFila(value) {
    setTempoFilaType(value);
    setLoadingTempoFilaType(true);
    await update({
      key: "tempofila",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTempoFilaType(false);
  }

  async function handleChangeIdFila(value) {
    setIdFilaType(value);
    setLoadingIdFilaType(true);
    await update({
      key: "idfila",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIdFilaType(false);
  }


  async function handleChangeMainColor(value) {
    setMainColorType(value);
    setLoadingMainColorType(true);
    await update({
      key: "mainColor",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingMainColorType(false);
  }

  async function handleChangeScrollbarColor(value) {
    setScrollbarColorType(value);
    setLoadingScrollbarColorType(true);
    await update({
      key: "scrollbarColor",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingScrollbarColorType(false);
  }

  async function handleChangeToolbarBackground(value) {
    setToolbarBackgroundType(value);
    setLoadingToolbarBackgroundType(true);
    await update({
      key: "toolbarBackground",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingToolbarBackgroundType(false);
  }

  /*
  async function handleChangeIPIxc(value) {
    setIpIxcType(value);
    setLoadingIpIxcType(true);
    await update({
      key: "ipixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpIxcType(false);
  }

  

  async function handleChangeTokenIxc(value) {
    setTokenIxcType(value);
    setLoadingTokenIxcType(true);
    await update({
      key: "tokenixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenIxcType(false);
  }

  async function handleChangeIpMkauth(value) {
    setIpMkauthType(value);
    setLoadingIpMkauthType(true);
    await update({
      key: "ipmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpMkauthType(false);
  }

  async function handleChangeClientIdMkauth(value) {
    setClientIdMkauthType(value);
    setLoadingClientIdMkauthType(true);
    await update({
      key: "clientidmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientIdMkauthType(false);
  }

  async function handleChangeClientSecrectMkauth(value) {
    setClientSecrectMkauthType(value);
    setLoadingClientSecrectMkauthType(true);
    await update({
      key: "clientsecretmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientSecrectMkauthType(false);
  }

  async function handleChangeAsaas(value) {
    setAsaasType(value);
    setLoadingAsaasType(true);
    await update({
      key: "asaas",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingAsaasType(false);
  }
  */

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    setLoadingSendGreetingAccepted(false);
  }

  return (
    <>
      <Grid spacing={3} container>
        {/* <Grid xs={12} item>
                    <Title>Configurações Gerais</Title>
                </Grid> */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="ratings-label">Avaliações</InputLabel>
            <Select
              labelId="ratings-label"
              value={userRating}
              onChange={async (e) => {
                handleChangeUserRating(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
              <MenuItem value={"enabled"}>Habilitadas</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRating && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">
              Gerenciamento de Expediente
            </InputLabel>
            <Select
              labelId="schedule-type-label"
              value={scheduleType}
              onChange={async (e) => {
                handleScheduleType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"queue"}>Gerenciamento Por Fila</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="group-type-label">
              Ignorar Mensagens de Grupos
            </InputLabel>
            <Select
              labelId="group-type-label"
              value={CheckMsgIsGroup}
              onChange={async (e) => {
                handleGroupType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desativado</MenuItem>
              <MenuItem value={"enabled"}>Ativado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="call-type-label">
              Aceitar Chamada
            </InputLabel>
            <Select
              labelId="call-type-label"
              value={callType}
              onChange={async (e) => {
                handleCallType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Não Aceitar</MenuItem>
              <MenuItem value={"enabled"}>Aceitar</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCallType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="chatbot-type-label">
              Tipo Chatbot
            </InputLabel>
            <Select
              labelId="chatbot-type-label"
              value={chatbotType}
              onChange={async (e) => {
                handleChatbotType(e.target.value);
              }}
            >
              <MenuItem value={"text"}>Texto</MenuItem>
              <MenuItem value={"button"}>Botão</MenuItem>
              <MenuItem value={"list"}>Lista</MenuItem>
            </Select>
            <FormHelperText>
              {loadingChatbotType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
    <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="outsidemessage-type-label">
              Abrir Tickets Fora do Expediente?
            </InputLabel>
            <Select
              labelId="outsidemessage-type-label"
              value={outsideMessageType}
              onChange={async (e) => {
                handleOutsideMessageType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Não</MenuItem>
              <MenuItem value={"enabled"}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingOutsideMessageType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="outsidequeue-type-label">
              Mover Tickets Sem Fila?
            </InputLabel>
            <Select
              labelId="outsidequeue-type-label"
              value={outsideQueueType}
              onChange={async (e) => {
                handleOutsideQueueType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Não</MenuItem>
              <MenuItem value={"enabled"}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingOutsideQueueType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingAccepted-label">Mensagem de Saudação do Operador?</InputLabel>
            <Select
              labelId="sendGreetingAccepted-label"
              value={SendGreetingAccepted}
              onChange={async (e) => {
                handleSendGreetingAccepted(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Não</MenuItem>
              <MenuItem value={"enabled"}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingAccepted && "Atualizando..."}
            </FormHelperText>
          </FormControl>
      </Grid>

   </Grid>
   <Grid spacing={3} container>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
          style={{
            marginBottom: 20,
            marginTop: 20
          }}
        >
          <Tab

            label="Configuração da Fila" />

        </Tabs>

    </Grid>
      {/*-----------------FILA-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        
        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="tempofila"
              name="tempofila"
              margin="dense"
              label="Tempo (minutos)"
              variant="outlined"
              value={tempofilaType}
              onChange={async (e) => {
                handleChangeTempoFila(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingTempoFilaType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="idfila"
              name="idfila"
              margin="dense"
              label="ID da Fila"
              variant="outlined"
              value={idfilaType}
              onChange={async (e) => {
                handleChangeIdFila(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingIdFilaType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>


      <Grid spacing={3} container>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
          style={{
            marginBottom: 20,
            marginTop: 20
          }}
        >
          <Tab

            label="Configuração de Cores" />

        </Tabs>

    </Grid>
      {/*-----------------CORES-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="mainColor"
              name="mainColor"
              margin="dense"
              label="Cor Principal (#000000)"
              variant="outlined"
              value={mainColor}
              onChange={async (e) => {
                handleChangeMainColor(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingMainColorType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="scrollbarColor"
              name="scrollbarColor"
              margin="dense"
              label="Cor da Scrollbar (#000000)"
              variant="outlined"
              value={scrollbarColor}
              onChange={async (e) => {
                handleChangeScrollbarColor(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingScrollbarColorType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="toolbarBackground"
              name="toolbarBackground"
              margin="dense"
              label="Cor da Toolbar (#000000)"
              variant="outlined"
              value={toolbarBackground}
              onChange={async (e) => {
                handleChangeToolbarBackground(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingToolbarBackgroundType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>


    </>
  );
}