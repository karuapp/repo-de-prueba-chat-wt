import React, { useContext, useState, useEffect } from 'react';
import Routes from './routes';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { ptBR } from '@material-ui/core/locale';
import EventEmitter from 'eventemitter3';
import {
  CssBaseline,
  Switch,
  FormGroup,
  FormControlLabel,
  makeStyles,
} from '@material-ui/core';
import lightBackground from '../src/assets/wa-background-light.png';
import darkBackground from '../src/assets/wa-background-dark.jpg';
import MomentUtils from '@date-io/moment';
import moment from 'moment';

import api from '../src/services/api';
import { DatePickerField } from './components/FormFields';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format } from 'date-fns';
import { SocketContext, socketManager } from './context/Socket/SocketContext';



const useStyles = makeStyles(() => ({
  switch: {
    margin: '2px',
    position: 'absolute',
    right: '0',
  },
  visible: {
    display: 'none',
  },
}));

export const mainEvents = new EventEmitter();

const App = () => {
  const [locale, setLocale] = useState();
  const [checked, setChecked] = React.useState(false);
  const [mainColor, setMainColor] = useState('#000000');
  const [scrollbarColor, setScrollbarColor] = useState('#000000');
  const classes = useStyles();

  useEffect(() => {
    fetchMainColor();
    fetchScrollbarColor();
  }, []);

  const fetchMainColor = async () => {
    try {
      const response = await api.get('/settings/mainColor');
      const fetchedColor = response.data?.value;
      //console.log(fetchedColor);
      setMainColor(fetchedColor);
    } catch (error) {
      console.error('Error retrieving main color', error);
    }
  };


  const fetchScrollbarColor = async () => {
    try {
      const response = await api.get('/settings/scrollbarColor');
      const fetchedColor = response.data?.value;
      //console.log(fetchedColor);
      setScrollbarColor(fetchedColor);
    } catch (error) {
      console.error('Error retrieving scrollbar color', error);
    }
  };

  useEffect(() => {
    // Pass the scrollbar color to the index.html file
    document.documentElement.style.setProperty(
      '--scrollbar-color',
      scrollbarColor
    );
  }, [scrollbarColor]);

  const lightTheme = createTheme(
    {
      palette: {
        primary: { main: mainColor },
        secondary: { main: mainColor },
        error: { main: '#ff0000' }, // cor dos icones
      },
      backgroundImage: `url(${lightBackground})`,
    },
    locale
  );

  const darkTheme = createTheme(
    {
      overrides: {
        MuiCssBaseline: {
          '@global': {
            body: {
              backgroundColor: '#1d2230',
            },
          },
        },
      },
      palette: {
        primary: { main: '#7d9bfa' },
        divider: '#464a5c',
        secondary: { main: '#eee' },
        error: { main: '#ff0000' }, // cor dos icones
        background: {
          default: '#1d2230',
          paper: '#2c3145',
        },
        text: {
          primary: '#eee',
          secondary: '#fff',
        },
      },
      backgroundImage: `url(${darkBackground})`,
    },
    locale
  );

  const cacheTheme = localStorage.getItem('layout-theme') || 'light';

  const [theme, setTheme] = useState(cacheTheme);

  const themeToggle = () => {
    const updatedTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(updatedTheme);
    localStorage.setItem('layout-theme', updatedTheme);
  };

  const handleChange = () => {
    themeToggle();
  };

  mainEvents.on('toggle-theme', handleChange);

  useEffect(() => {
    const i18nlocale = localStorage.getItem('i18nextLng');
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === 'ptBR') {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <SocketContext.Provider value={socketManager}>
        <Routes />
        <CssBaseline />
      </SocketContext.Provider>
    </ThemeProvider>
  );
};

export default App;
