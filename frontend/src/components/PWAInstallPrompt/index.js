import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  ntSubTituloTKC: {
    '--ntSubTitulo': theme.mode === 'light' ? '#54656f' : '#ababab',
  },
  ntButtonTKC: {
    '--btnPwaTicket': theme.mode === 'light' ? '#0000ff' : '#232323',
    '--brancoBtnPwa': theme.mode === 'light' ? '#fff' : '#d1d1d1',
    '&:hover': {
      '--btnPwaTicket': theme.mode === 'light' ? '#0000bd' : '#3d3d3d',
    },
  },
  ntTituloTKC: {
    '--ntTitulo': theme.mode === 'light' ? '#41525d' : '#d6d7d7',
  },
}));

const PWAInstallPrompt = () => {
  const classes = useStyles();
  
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(localStorage.getItem('isInstalled') === 'true');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [osName, setOsName] = useState('');

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();
    if (platform.includes("win")) {
      setOsName("Windows");
    } else if (platform.includes("mac")) {
      setOsName("Mac");
    } else {
      setOsName("Seu Sistema");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkInstallationStatus = async () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isCurrentlyInstalled = isStandalone || localStorage.getItem('isInstalled') === 'true';
      if (mounted) {
        setIsInstalled(isCurrentlyInstalled);
        setIsInstallable(!isCurrentlyInstalled);
      }
    };

    checkInstallationStatus();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      localStorage.setItem('isInstalled', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mounted = false;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        localStorage.setItem('isInstalled', 'true');
      }
    } else {
      console.log('O evento beforeinstallprompt não foi disparado');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        alert("Para instalar o PWA, use o ícone na barra de navegação.");
      }
    }
  };

  if (!isInstalled && isInstallable) {
    return (
      <>
        <p className={`ntTitulo ${classes.ntTituloTKC}`}>
          Baixe o Atevus para {osName}
        </p>
        <span className={`ntSubTitulo ${classes.ntSubTituloTKC}`}>
          Baixe o novo app para {osName} para ter uma experiência de uso <br /> mais rápida, instalação simples.
        </span>
        <button
          className={`ntButton ${classes.ntButtonTKC}`}
          onClick={handleInstallClick}
        >
          Baixar o App PWA
        </button>
      </>
    );
  }

  return (
    <>
      <p className={`ntTitulo ${classes.ntTituloTKC}`}>
        Agilidade no Atendimento
      </p>
      <span className={`ntSubTitulo ${classes.ntSubTituloTKC}`}>
        Organize, acompanhe e resolva atendimentos com agilidade. O Atevus facilita seu <br />trabalho e aumenta sua produtividade!
      </span>
    </>
  );
};

export default PWAInstallPrompt;
