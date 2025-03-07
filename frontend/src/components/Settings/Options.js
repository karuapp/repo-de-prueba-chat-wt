import React, { useEffect, useState, useContext } from 'react';

import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Title from '../Title';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import useSettings from '../../hooks/useSettings';
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { grey, blue } from '@material-ui/core/colors';
import { Tabs, Tab } from '@material-ui/core';
import { SketchPicker } from 'react-color';
import Popover from '@material-ui/core/Popover';
//import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../context/Auth/AuthContext';
import { Can } from '../Can';
import useAuth from '../../hooks/useAuth.js';
import OnlyForSuperUser from '../../components/OnlyForSuperUser';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: 240,
  },
  tab: {
    background: '#f2f5f3',
    borderRadius: 4,
    width: '100%',
    '& .MuiTab-wrapper': {
      color: '#128c7e',
    },
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  cardAvatar: {
    fontSize: '55px',
    color: grey[500],
    backgroundColor: '#ffffff',
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: '18px',
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: '14px',
  },
  alignRight: {
    textAlign: 'right',
  },
  fullWidth: {
    width: '100%',
  },
  selectContainer: {
    width: '100%',
    textAlign: 'left',
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();

  const [currentUser, setCurrentUser] = useState({});
  const { getCurrentUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSuper = () => {
    return currentUser.super;
  };

  //console.log(currentUser);

  const [scheduleType, setScheduleType] = useState('disabled');
  const [callType, setCallType] = useState('enabled');
  const [outsideMessageType, setOutsideMessageType] = useState('disabled');
  const [outsideQueueType, setOutsideQueueType] = useState('disabled');
  const [chatbotType, setChatbotType] = useState('');

  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState('enabled');

  const [userRating, setUserRating] = useState('disabled');
  const [loadingUserRating, setLoadingUserRating] = useState(false);

  const [userRatingOut, setUserRatingOut] = useState('disabled');
  const [loadingUserRatingOut, setLoadingUserRatingOut] = useState(false);

  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingOutsideMessageType, setLoadingOutsideMessageType] =
    useState(false);
  const [loadingOutsideQueueType, setLoadingOutsideQueueType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);
  const [loadingCheckMsgIsGroup, setCheckMsgIsGroup] = useState(false);

  const [eficlientidType, setEfiClientidType] = useState('');
  const [loadingEfiClientidType, setLoadingEfiClientidType] = useState(false);

  const [eficlientsecretType, setEfiClientsecretType] = useState('');
  const [loadingEfiClientsecretType, setLoadingEfiClientsecretType] =
    useState(false);

  const [efichavepixType, setEfiChavepixType] = useState('');
  const [loadingEfiChavepixType, setLoadingEfiChavepixType] = useState(false);

  const [mpaccesstokenType, setmpaccesstokenType] = useState('');
  const [loadingmpaccesstokenType, setLoadingmpaccesstokenType] =
    useState(false);

  const [stripeprivatekeyType, setstripeprivatekeyType] = useState('');
  const [loadingstripeprivatekeyType, setLoadingstripeprivatekeyType] =
    useState(false);

  const [asaastokenType, setasaastokenType] = useState('');
  const [loadingasaastokenType, setLoadingasaastokenType] = useState(false);

  const [sendgridapiType, setsendgridapiType] = useState('');
  const [loadingsendgridapiType, setLoadingsendgridapiType] = useState(false);

  const [emailsenderType, setemailsenderType] = useState('');
  const [loadingemailsenderType, setLoadingemailsenderType] = useState(false);

  const [ratingurlType, setratingurlType] = useState('');
  const [loadingratingurlType, setLoadingratingurlType] = useState(false);

  const [tokenTypebot, setTokenTypebot] = useState("");
  const [loadingtokenTypebot, setLoadingTokenTypebot] = useState(false);

  const [urlTypebot, setUrlTypebot] = useState("");
  const [loadingUrlTypebot, setLoadingUrlTypebot] = useState(false);

  const [urlBotTypebot, setUrlBotTypebot] = useState("");
  const [loadingUrlBotTypebot, setLoadingUrlBotTypebot] = useState(false);

  const [urlN8N, setUrlN8N] = useState("");
  const [loadingUrlN8N, setLoadingUrlN8N] = useState(false);

  const [apiKeyN8N, setApiKeyN8N] = useState("");
  const [loadingApiKeyN8N, setLoadingApiKeyN8N] = useState(false);


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
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState('enabled');
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] =
    useState(false);

  const [SendTransferAlert, setSendTransferAlert] = useState('enabled');
  const [loadingSendTransferAlert, setLoadingSendTransferAlert] =
    useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] =
    useState('disabled');
  const [
    loadingSendFarewellWaitingTicket,
    setLoadingSendFarewellWaitingTicket,
  ] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState('enabled');
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] =
    useState('enabled');
  const [
    loadingSendGreetingMessageOneQueues,
    setLoadingSendGreetingMessageOneQueues,
  ] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState('enabled');
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] =
    useState(false);

  const [viewclosed, setviewclosed] = useState('disabled');
  const [loadingviewclosed, setLoadingviewclosed] = useState(false);

  const [viewgroups, setviewgroups] = useState('disabled');
  const [loadingviewgroups, setLoadingviewgroups] = useState(false);

  const [viewnoti, setviewnoti] = useState('disabled');
  const [loadingviewnoti, setLoadingviewnoti] = useState(false);

  const [viewppw, setviewppw] = useState('disabled');
  const [loadingviewppw, setLoadingviewppw] = useState(false);

  const [viewterms, setviewterms] = useState('disabled');
  const [loadingviewterms, setLoadingviewterms] = useState(false);

  const [viewprivacy, setviewprivacy] = useState('disabled');
  const [loadingviewprivacy, setLoadingviewprivacy] = useState(false);

  const [viewregister, setviewregister] = useState('disabled');
  const [loadingviewregister, setLoadingviewregister] = useState(false);

  const [externaldownload, setexternaldownload] = useState('disabled');
  const [loadingexternaldownload, setLoadingexternaldownload] = useState(false);

  const [camposfixos, setcamposfixos] = useState('disabled');
  const [loadingcamposfixos, setLoadingcamposfixos] = useState(false);

  const [allowupserts, setallowupserts] = useState('disabled');
  const [loadingallowupserts, setLoadingallowupserts] = useState(false);

  const [allowregister, setallowregister] = useState('disabled');
  const [loadingallowregister, setLoadingallowregister] = useState(false);

  const [trial, settrial] = useState('3');
  const [loadingtrial, setLoadingtrial] = useState(false);

  const [emfila, setemfila] = useState('disabled');
  const [loadingemfila, setLoadingemfila] = useState(false);

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find((s) => s.key === 'userRating');
      if (userRating) {
        setUserRating(userRating.value);
      }

      const userRatingOut = settings.find((s) => s.key === 'userRatingOut');
      if (userRatingOut) {
        setUserRatingOut(userRatingOut.value);
      }

      const scheduleType = settings.find((s) => s.key === 'scheduleType');
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }
      const callType = settings.find((s) => s.key === 'call');
      if (callType) {
        setCallType(callType.value);
      }

      const outsideMessageType = settings.find(
        (s) => s.key === 'outsidemessage'
      );
      if (outsideMessageType) {
        setOutsideMessageType(outsideMessageType.value);
      }

      const outsideQueueType = settings.find((s) => s.key === 'outsidequeue');
      if (outsideQueueType) {
        setOutsideQueueType(outsideQueueType.value);
      }

      const CheckMsgIsGroup = settings.find((s) => s.key === 'CheckMsgIsGroup');
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }
      const chatbotType = settings.find((s) => s.key === 'chatBotType');
      if (chatbotType) {
        setChatbotType(chatbotType.value);
      }

      const eficlientidType = settings.find((s) => s.key === 'eficlientid');
      if (eficlientidType) {
        setEfiClientidType(eficlientidType.value);
      }

      const eficlientsecretType = settings.find(
        (s) => s.key === 'eficlientsecret'
      );
      if (eficlientsecretType) {
        setEfiClientsecretType(eficlientsecretType.value);
      }

      const efichavepixType = settings.find((s) => s.key === 'efichavepix');
      if (efichavepixType) {
        setEfiChavepixType(efichavepixType.value);
      }

      const mpaccesstokenType = settings.find((s) => s.key === 'mpaccesstoken');
      if (mpaccesstokenType) {
        setmpaccesstokenType(mpaccesstokenType.value);
      }

      const stripeprivatekeyType = settings.find(
        (s) => s.key === 'stripeprivatekey'
      );
      if (stripeprivatekeyType) {
        setstripeprivatekeyType(stripeprivatekeyType.value);
      }

      const sendgridapiType = settings.find((s) => s.key === 'sendgridapi');
      if (sendgridapiType) {
        setsendgridapiType(sendgridapiType.value);
      }

      const emailsenderType = settings.find((s) => s.key === 'emailsender');
      if (emailsenderType) {
        setemailsenderType(emailsenderType.value);
      }

      const ratingurlType = settings.find((s) => s.key === 'ratingurl');
      if (ratingurlType) {
        setratingurlType(ratingurlType.value);
      }

      const asaastokenType = settings.find((s) => s.key === 'asaastoken');
      if (asaastokenType) {
        setasaastokenType(asaastokenType.value);
      }

      const tokenTypebot = settings.find((s) => s.key === "tokenTypebot");
      if (tokenTypebot) {
        setTokenTypebot(tokenTypebot.value);
      }
      const urlTypebot = settings.find((s) => s.key === "urlTypebot");
      if (urlTypebot) {
        setUrlTypebot(urlTypebot.value);
      }
      const urlBotTypebot = settings.find((s) => s.key === "urlBotTypebot");
      if (urlBotTypebot) {
        setUrlBotTypebot(urlBotTypebot.value);
      }
      const urlN8N = settings.find((s) => s.key === "urlN8N");
      if (urlN8N) {
        setUrlN8N(urlN8N.value);
      }
      const apiKeyN8N = settings.find((s) => s.key === "apiKeyN8N");
      if (apiKeyN8N) {
        setApiKeyN8N(apiKeyN8N.value);
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

      const SendGreetingAccepted = settings.find(
        (s) => s.key === 'sendGreetingAccepted'
      );
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }

      const SendTransferAlert = settings.find(
        (s) => s.key === 'sendTransferAlert'
      );
      if (SendTransferAlert) {
        setSendTransferAlert(SendTransferAlert.value);
      }

      const sendFarewellWaitingTicket = settings.find(
        (s) => s.key === 'sendFarewellWaitingTicket'
      );
      if (sendFarewellWaitingTicket) {
        setSendFarewellWaitingTicket(sendFarewellWaitingTicket.value);
      }

      const sendSignMessage = settings.find((s) => s.key === 'sendSignMessage');
      if (sendSignMessage) {
        setSendSignMessage(sendSignMessage.value);
      }

      const sendGreetingMessageOneQueues = settings.find(
        (s) => s.key === 'sendGreetingMessageOneQueues'
      );
      if (sendGreetingMessageOneQueues) {
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value);
      }

      const sendQueuePosition = settings.find(
        (s) => s.key === 'sendQueuePosition'
      );
      if (sendQueuePosition) {
        setSendQueuePosition(sendQueuePosition.value);
      }

      const viewclosed = settings.find((s) => s.key === 'viewclosed');
      if (viewclosed) {
        setviewclosed(viewclosed.value);
      }

      const viewgroups = settings.find((s) => s.key === 'viewgroups');
      if (viewgroups) {
        setviewgroups(viewgroups.value);
      }

      const viewnoti = settings.find((s) => s.key === 'viewnoti');
      if (viewnoti) {
        setviewnoti(viewnoti.value);
      }

      const viewppw = settings.find((s) => s.key === 'viewppw');
      if (viewppw) {
        setviewppw(viewppw.value);
      }

      const viewterms = settings.find((s) => s.key === 'viewterms');
      if (viewterms) {
        setviewterms(viewterms.value);
      }

      const viewprivacy = settings.find((s) => s.key === 'viewprivacy');
      if (viewprivacy) {
        setviewprivacy(viewprivacy.value);
      }

      const viewregister = settings.find((s) => s.key === 'viewregister');
      if (viewregister) {
        setviewregister(viewregister.value);
      }

      const externaldownload = settings.find(
        (s) => s.key === 'externaldownload'
      );
      if (externaldownload) {
        setexternaldownload(externaldownload.value);
      }

      const camposfixos = settings.find((s) => s.key === 'camposfixos');
      if (camposfixos) {
        setcamposfixos(camposfixos.value);
      }

      const allowupserts = settings.find((s) => s.key === 'allowupserts');
      if (allowupserts) {
        setallowupserts(allowupserts.value);
      }

      const allowregister = settings.find((s) => s.key === 'allowregister');
      if (allowregister) {
        setallowregister(allowregister.value);
      }

      const trial = settings.find((s) => s.key === 'trial');
      if (trial) {
        settrial(trial.value);
      }

      const emfila = settings.find((s) => s.key === 'emfila');
      if (emfila) {
        setemfila(emfila.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: 'userRating',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingUserRating(false);
  }

  async function handleChangeUserRatingOut(value) {
    setUserRatingOut(value);
    setLoadingUserRatingOut(true);
    await update({
      key: 'userRatingOut',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingUserRatingOut(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: 'scheduleType',
      value,
    });
    //toast.success("Oraçãpeo atualizada com sucesso.");
    toast.success('Operação atualizada com sucesso.', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: 'light',
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === 'function') {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({
      key: 'call',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingCallType(false);
  }

  async function handleOutsideMessageType(value) {
    setOutsideMessageType(value);
    setLoadingOutsideMessageType(true);
    await update({
      key: 'outsidemessage',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingOutsideMessageType(false);
  }

  async function handleOutsideQueueType(value) {
    setOutsideQueueType(value);
    setLoadingOutsideQueueType(true);
    await update({
      key: 'outsidequeue',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingOutsideQueueType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({
      key: 'chatBotType',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    setCheckMsgIsGroup(true);
    await update({
      key: 'CheckMsgIsGroup',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setCheckMsgIsGroup(false);
    /*     if (typeof scheduleTypeChanged === "function") {
          scheduleTypeChanged(value);
        } */
  }

  async function handleChangeEfiClientid(value) {
    setEfiClientidType(value);
    setLoadingEfiClientidType(true);
    await update({
      key: 'eficlientid',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiClientidType(false);
  }

  async function handleChangeEfiClientsecret(value) {
    setEfiClientsecretType(value);
    setLoadingEfiClientsecretType(true);
    await update({
      key: 'eficlientsecret',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiClientsecretType(false);
  }

  async function handleChangeEfiChavepix(value) {
    setEfiChavepixType(value);
    setLoadingEfiChavepixType(true);
    await update({
      key: 'efichavepix',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiChavepixType(false);
  }

  async function handleChangempaccesstoken(value) {
    setmpaccesstokenType(value);
    setLoadingmpaccesstokenType(true);
    await update({
      key: 'mpaccesstoken',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingmpaccesstokenType(false);
  }

  async function handleChangestripeprivatekey(value) {
    setstripeprivatekeyType(value);
    setLoadingstripeprivatekeyType(true);
    await update({
      key: 'stripeprivatekey',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingstripeprivatekeyType(false);
  }

  async function handleChangeasaastoken(value) {
    setasaastokenType(value);
    setLoadingasaastokenType(true);
    await update({
      key: 'asaastoken',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingasaastokenType(false);
  }

  async function handleChangeemailsender(value) {
    setemailsenderType(value);
    setLoadingemailsenderType(true);
    await update({
      key: 'emailsender',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingemailsenderType(false);
  }

  async function handleChangeratingurl(value) {
    setratingurlType(value);
    setLoadingratingurlType(true);
    await update({
      key: 'ratingurl',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingratingurlType(false);
  }

  async function handleChangesendgridapi(value) {
    setsendgridapiType(value);
    setLoadingsendgridapiType(true);
    await update({
      key: 'sendgridapi',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingsendgridapiType(false);
  }

  async function handleChangeTokenTypebot(value) {
    setTokenTypebot(value);
    setLoadingTokenTypebot(true);
    await update({
      key: "tokenTypebot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenTypebot(false);
  }

  async function handleChangeUrlTypebot(value) {
    setUrlTypebot(value);
    setLoadingUrlTypebot(true);
    await update({
      key: "urlTypebot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlTypebot(false);
  }

  async function handleChangeUrlBotTypebot(value) {
    setUrlBotTypebot(value);
    setLoadingUrlBotTypebot(true);
    await update({
      key: "urlBotTypebot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlBotTypebot(false);
  }

  async function handleChangeUrlN8N(value) {
    setUrlN8N(value);
    setLoadingUrlN8N(true);
    await update({
      key: "urlN8N",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlN8N(false);
  }
  
  async function handleChangeApiKeyN8N(value) {
    setApiKeyN8N(value);
    setLoadingApiKeyN8N(true);
    await update({
      key: "apiKeyN8N",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingApiKeyN8N(false);
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
      key: 'sendGreetingAccepted',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendGreetingAccepted(false);
  }

  async function handleSendTransferAlert(value) {
    setSendTransferAlert(value);
    setLoadingSendTransferAlert(true);
    await update({
      key: 'sendTransferAlert',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendTransferAlert(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({
      key: 'sendFarewellWaitingTicket',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({
      key: 'sendSignMessage',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      key: 'sendGreetingMessageOneQueues',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({
      key: 'sendQueuePosition',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingSendQueuePosition(false);
  }

  async function handleviewclosed(value) {
    setviewclosed(value);
    setLoadingviewclosed(true);
    await update({
      key: 'viewclosed',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewclosed(false);
  }

  async function handleviewgroups(value) {
    setviewgroups(value);
    setLoadingviewgroups(true);
    await update({
      key: 'viewgroups',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewgroups(false);
  }

  async function handleviewnoti(value) {
    setviewnoti(value);
    setLoadingviewnoti(true);
    await update({
      key: 'viewnoti',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewnoti(false);
  }

  async function handleviewppw(value) {
    setviewppw(value);
    setLoadingviewppw(true);
    await update({
      key: 'viewppw',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewppw(false);
  }

  async function handleviewterms(value) {
    setviewterms(value);
    setLoadingviewterms(true);
    await update({
      key: 'viewterms',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewterms(false);
  }

  async function handleviewprivacy(value) {
    setviewprivacy(value);
    setLoadingviewprivacy(true);
    await update({
      key: 'viewprivacy',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewprivacy(false);
  }

  async function handleviewregister(value) {
    setviewregister(value);
    setLoadingviewregister(true);
    await update({
      key: 'viewregister',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingviewregister(false);
  }

  async function handleexternaldownload(value) {
    setexternaldownload(value);
    setLoadingexternaldownload(true);
    await update({
      key: 'externaldownload',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingexternaldownload(false);
  }

  async function handlecamposfixos(value) {
    setcamposfixos(value);
    setLoadingcamposfixos(true);
    await update({
      key: 'camposfixos',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingcamposfixos(false);
  }

  async function handleallowupserts(value) {
    setallowupserts(value);
    setLoadingallowupserts(true);
    await update({
      key: 'allowupserts',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingallowupserts(false);
  }

  async function handleallowregister(value) {
    setallowregister(value);
    setLoadingallowregister(true);
    await update({
      key: 'allowregister',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingallowregister(false);
  }

  async function handletrial(value) {
    settrial(value);
    setLoadingtrial(true);
    await update({
      key: 'trial',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingtrial(false);
  }

  async function handleemfila(value) {
    setemfila(value);
    setLoadingemfila(true);
    await update({
      key: 'emfila',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingemfila(false);
  }

  return (
    <>
      <Grid spacing={3} container>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='ratings-label'>Enviar Avaliações</InputLabel>
            <Select
              labelId='ratings-label'
              value={userRating}
              onChange={async (e) => {
                handleChangeUserRating(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRating && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='ratingsout-label'>Avaliação Externa?</InputLabel>
            <Select
              labelId='ratingsout-label'
              value={userRatingOut}
              onChange={async (e) => {
                handleChangeUserRatingOut(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRatingOut && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id='ratingurl'
              name='ratingurl'
              margin='dense'
              label='URL da Avaliação Externa'
              variant='outlined'
              value={ratingurlType}
              onChange={async (e) => {
                handleChangeratingurl(e.target.value);
              }}
            ></TextField>
            <FormHelperText>
              {loadingratingurlType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='schedule-type-label'>
              Gerenciamento de Expediente
            </InputLabel>
            <Select
              labelId='schedule-type-label'
              value={scheduleType}
              onChange={async (e) => {
                handleScheduleType(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Desabilitado</MenuItem>
              <MenuItem value={'queue'}>Gerenciamento Por Fila</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='group-type-label'>
              Ignorar Mensagens de Grupos
            </InputLabel>
            <Select
              labelId='group-type-label'
              value={CheckMsgIsGroup}
              onChange={async (e) => {
                handleGroupType(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Desativado</MenuItem>
              <MenuItem value={'enabled'}>Ativado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='call-type-label'>Aceitar Chamada</InputLabel>
            <Select
              labelId='call-type-label'
              value={callType}
              onChange={async (e) => {
                handleCallType(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não Aceitar</MenuItem>
              <MenuItem value={'enabled'}>Aceitar</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCallType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='chatbot-type-label'>Tipo Chatbot</InputLabel>
            <Select
              labelId='chatbot-type-label'
              value={chatbotType}
              onChange={async (e) => {
                handleChatbotType(e.target.value);
              }}
            >
              <MenuItem value={'text'}>Texto</MenuItem>
              <MenuItem value={'list'}>Listas</MenuItem>
            </Select>
            <FormHelperText>
              {loadingChatbotType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='outsidemessage-type-label'>
              Abrir Tickets Fora do Expediente?
            </InputLabel>
            <Select
              labelId='outsidemessage-type-label'
              value={outsideMessageType}
              onChange={async (e) => {
                handleOutsideMessageType(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingOutsideMessageType && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendGreetingAccepted-label'>
              Mensagem de Saudação do Operador?
            </InputLabel>
            <Select
              labelId='sendGreetingAccepted-label'
              value={SendGreetingAccepted}
              onChange={async (e) => {
                handleSendGreetingAccepted(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingAccepted && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendTransferAlert-label'>
              Mensagem de Transferência?
            </InputLabel>
            <Select
              labelId='sendTransferAlert-label'
              value={SendTransferAlert}
              onChange={async (e) => {
                handleSendTransferAlert(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendTransferAlert && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendFarewellWaitingTicket-label'>
              Mensagem de Despedida por Operador
            </InputLabel>
            <Select
              labelId='sendFarewellWaitingTicket-label'
              value={sendFarewellWaitingTicket}
              onChange={async (e) => {
                handleSendFarewellWaitingTicket(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendFarewellWaitingTicket && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendSignMessage-label'>
              Atendente pode escolher ENVIAR Assinatura?
            </InputLabel>
            <Select
              labelId='sendSignMessage-label'
              value={sendSignMessage}
              onChange={async (e) => {
                handleSendSignMessage(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendSignMessage && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendGreetingMessageOneQueues-label'>
              Mensagem de Saudação para fila única?
            </InputLabel>
            <Select
              labelId='sendGreetingMessageOneQueues-label'
              value={sendGreetingMessageOneQueues}
              onChange={async (e) => {
                handleSendGreetingMessageOneQueues(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingMessageOneQueues && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='sendQueuePosition-label'>
              Informar Posição na Fila?
            </InputLabel>
            <Select
              labelId='sendQueuePosition-label'
              value={sendQueuePosition}
              onChange={async (e) => {
                handleSendQueuePosition(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendQueuePosition && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='viewclosed-label'>
              Operador Visualiza Tickets Fechados?
            </InputLabel>
            <Select
              labelId='viewclosed-label'
              value={viewclosed}
              onChange={async (e) => {
                handleviewclosed(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingviewclosed && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='viewgroups-label'>
              Operador Visualiza Grupos?
            </InputLabel>
            <Select
              labelId='viewgroups-label'
              value={viewgroups}
              onChange={async (e) => {
                handleviewgroups(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingviewgroups && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='viewnoti-label'>
              Operador Visualiza Notificação Global?
            </InputLabel>
            <Select
              labelId='viewnoti-label'
              value={viewnoti}
              onChange={async (e) => {
                handleviewnoti(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingviewnoti && 'Atualizando...'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='viewppw-label'>
              Operador Visualiza Prévias?
            </InputLabel>
            <Select
              labelId='viewppw-label'
              value={viewppw}
              onChange={async (e) => {
                handleviewppw(e.target.value);
              }}
            >
              <MenuItem value={'disabled'}>Não</MenuItem>
              <MenuItem value={'enabled'}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingviewppw && 'Atualizando...'}
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

            label="INTEGRAÇÕES" />

        </Tabs>

      </Grid>
          
      {/*-----------------TypeBot-----------------*/}
      <Grid spacing={3} container style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="TYPEBOT" />
        </Tabs>
        <Grid  xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="urltypebot"
              name="urltypebot"
              margin="dense"
              label="Url Typebot"
              variant="outlined"
              value={urlTypebot}
              onChange={async (e) => {
                handleChangeUrlTypebot(e.target.value);
              }}
            />
            <FormHelperText>
              {loadingUrlTypebot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid  xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="urlBotTypebot"
              name="urlBotTypebot"
              margin="dense"
              label="Url Bot Typebot"
              variant="outlined"
              value={urlBotTypebot}
              onChange={async (e) => {
                handleChangeUrlBotTypebot(e.target.value);
              }}
            />
            <FormHelperText>
              {loadingUrlBotTypebot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid  xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="tokentypebot"
              name="tokentypebot"
              margin="dense"
              label="Token Typebot"
              variant="outlined"
              value={tokenTypebot}
              onChange={async (e) => {
                handleChangeTokenTypebot(e.target.value);
              }}
            />
            <FormHelperText>
              {loadingtokenTypebot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
       {/*-----------------N8N-----------------*/}
       <Grid spacing={3} container style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="N8N" />
        </Tabs>
        <Grid  xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="urlN8N"
              name="urlN8N"
              margin="dense"
              label="Url N8N"
              variant="outlined"
              value={urlN8N}
              onChange={async (e) => {
                handleChangeUrlN8N(e.target.value);
              }}
            />
            <FormHelperText>
              {loadingUrlN8N && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid  xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="apiKeyN8N"
              name="apiKeyN8N"
              margin="dense"
              label="API KEY N8N"
              variant="outlined"
              value={apiKeyN8N}
              onChange={async (e) => {
                handleChangeApiKeyN8N(e.target.value);
              }}
            />
            <FormHelperText>
              {loadingApiKeyN8N && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      
      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <>
            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='Configurações Globais' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='viewterms-label'>
                    Termos de Uso Visível?
                  </InputLabel>
                  <Select
                    labelId='viewterms-label'
                    value={viewterms}
                    onChange={async (e) => {
                      handleviewterms(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingviewterms && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='viewprivacy-label'>
                    Política de Privacidade Visível?
                  </InputLabel>
                  <Select
                    labelId='viewprivacy-label'
                    value={viewprivacy}
                    onChange={async (e) => {
                      handleviewprivacy(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingviewprivacy && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='viewregister-label'>
                    Registro (Inscrição) Visível?
                  </InputLabel>
                  <Select
                    labelId='viewregister-label'
                    value={viewregister}
                    onChange={async (e) => {
                      handleviewregister(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingviewregister && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='allowregister-label'>
                    Registro (Inscrição) Permitida?
                  </InputLabel>
                  <Select
                    labelId='allowregister-label'
                    value={allowregister}
                    onChange={async (e) => {
                      handleallowregister(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingallowregister && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='externaldownload-label'>
                    Permitir Download Externo?
                  </InputLabel>
                  <Select
                    labelId='externaldownload-label'
                    value={externaldownload}
                    onChange={async (e) => {
                      handleexternaldownload(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingexternaldownload && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='camposfixos-label'>
                    Campos Extras Fixos no Contato?
                  </InputLabel>
                  <Select
                    labelId='camposfixos-label'
                    value={camposfixos}
                    onChange={async (e) => {
                      handlecamposfixos(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingcamposfixos && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='externaldownload-label'>
                    Permitir Importação de Contatos Automática?
                  </InputLabel>
                  <Select
                    labelId='allowupserts-label'
                    value={allowupserts}
                    onChange={async (e) => {
                      handleallowupserts(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingallowupserts && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='emfila-label'>
                    Mensagens em fila (Redis para Alto Volume)?
                  </InputLabel>
                  <Select
                    labelId='emfila-label'
                    value={emfila}
                    onChange={async (e) => {
                      handleemfila(e.target.value);
                    }}
                  >
                    <MenuItem value={'disabled'}>Não</MenuItem>
                    <MenuItem value={'enabled'}>Sim</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingemfila && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <InputLabel id='trial-label'>Tempo de Trial?</InputLabel>
                  <Select
                    labelId='trial-label'
                    value={trial}
                    onChange={async (e) => {
                      handletrial(e.target.value);
                    }}
                  >
                    <MenuItem value={'1'}>1</MenuItem>
                    <MenuItem value={'2'}>2</MenuItem>
                    <MenuItem value={'3'}>3</MenuItem>
                    <MenuItem value={'4'}>4</MenuItem>
                    <MenuItem value={'5'}>5</MenuItem>
                    <MenuItem value={'6'}>6</MenuItem>
                    <MenuItem value={'7'}>7</MenuItem>
                  </Select>
                  <FormHelperText>
                    {loadingtrial && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='SMTP API (SendGrid)' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='sendgridapi'
                    name='sendgridapi'
                    margin='dense'
                    label='API SendGrid'
                    variant='outlined'
                    value={sendgridapiType}
                    onChange={async (e) => {
                      handleChangesendgridapi(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingsendgridapiType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='emailsender'
                    name='emailsender'
                    margin='dense'
                    label='Rementente de E-Mail'
                    variant='outlined'
                    value={emailsenderType}
                    onChange={async (e) => {
                      handleChangeemailsender(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingemailsenderType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='Configuração Pix Efí (GerenciaNet)' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='eficlientid'
                    name='eficlientid'
                    margin='dense'
                    label='Client ID'
                    variant='outlined'
                    value={eficlientidType}
                    onChange={async (e) => {
                      handleChangeEfiClientid(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingEfiClientidType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='eficlientsecret'
                    name='eficlientsecret'
                    margin='dense'
                    label='Client Secret'
                    variant='outlined'
                    value={eficlientsecretType}
                    onChange={async (e) => {
                      handleChangeEfiClientsecret(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingEfiClientsecretType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='efichavepix'
                    name='efichavepix'
                    margin='dense'
                    label='Chave PIX'
                    variant='outlined'
                    value={efichavepixType}
                    onChange={async (e) => {
                      handleChangeEfiChavepix(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingEfiChavepixType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='Mercado Pago' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='mpaccesstoken'
                    name='mpaccesstoken'
                    margin='dense'
                    label='Access Token'
                    variant='outlined'
                    value={mpaccesstokenType}
                    onChange={async (e) => {
                      handleChangempaccesstoken(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingmpaccesstokenType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='Stripe' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='stripeprivatekey'
                    name='stripeprivatekey'
                    margin='dense'
                    label='Stripe Private Key'
                    variant='outlined'
                    value={stripeprivatekeyType}
                    onChange={async (e) => {
                      handleChangestripeprivatekey(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingstripeprivatekeyType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid spacing={3} container>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                scrollButtons='on'
                variant='scrollable'
                className={classes.tab}
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                <Tab label='ASAAS' />
              </Tabs>
            </Grid>

            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='asaastoken'
                    name='asaastoken'
                    margin='dense'
                    label='Token Asaas'
                    variant='outlined'
                    value={asaastokenType}
                    onChange={async (e) => {
                      handleChangeasaastoken(e.target.value);
                    }}
                  ></TextField>
                  <FormHelperText>
                    {loadingasaastokenType && 'Atualizando...'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            
            {/*-----------------TypeBot-----------------*/}
            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="on"
                variant="scrollable"
                className={classes.tab}
              >
                <Tab label="TYPEBOT" />
              </Tabs>
              <Grid  xs={12} sm={12} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="urltypebot"
                    name="urltypebot"
                    margin="dense"
                    label="Url Typebot"
                    variant="outlined"
                    value={urlTypebot}
                    onChange={async (e) => {
                      handleChangeUrlTypebot(e.target.value);
                    }}
                  />
                  <FormHelperText>
                    {loadingUrlTypebot && "Atualizando..."}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid  xs={12} sm={12} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="urlBotTypebot"
                    name="urlBotTypebot"
                    margin="dense"
                    label="Url Bot Typebot"
                    variant="outlined"
                    value={urlBotTypebot}
                    onChange={async (e) => {
                      handleChangeUrlBotTypebot(e.target.value);
                    }}
                  />
                  <FormHelperText>
                    {loadingUrlBotTypebot && "Atualizando..."}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid  xs={12} sm={12} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="tokentypebot"
                    name="tokentypebot"
                    margin="dense"
                    label="Token Typebot"
                    variant="outlined"
                    value={tokenTypebot}
                    onChange={async (e) => {
                      handleChangeTokenTypebot(e.target.value);
                    }}
                  />
                  <FormHelperText>
                    {loadingtokenTypebot && "Atualizando..."}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            {/*-----------------N8N-----------------*/}
            <Grid spacing={3} container style={{ marginBottom: 10 }}>
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="on"
                variant="scrollable"
                className={classes.tab}
              >
                <Tab label="N8N" />
              </Tabs>
              <Grid  xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="urlN8N"
                    name="urlN8N"
                    margin="dense"
                    label="Url N8N"
                    variant="outlined"
                    value={urlN8N}
                    onChange={async (e) => {
                      handleChangeUrlN8N(e.target.value);
                    }}
                  />
                  <FormHelperText>
                    {loadingUrlN8N && "Atualizando..."}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid  xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id="apiKeyN8N"
                    name="apiKeyN8N"
                    margin="dense"
                    label="API KEY N8N"
                    variant="outlined"
                    value={apiKeyN8N}
                    onChange={async (e) => {
                      handleChangeApiKeyN8N(e.target.value);
                    }}
                  />
                  <FormHelperText>
                    {loadingApiKeyN8N && "Atualizando..."}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

          </>
        )}
      />
    </>
  );
}
