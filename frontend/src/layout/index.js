import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";
import { Link as RouterLink } from 'react-router-dom';
// import moment from "moment";
// import { isNill } from "lodash";
// import SoftPhone from "react-softphone";
// import { WebSocketInterface } from "jssip";
import { makeStyles, Drawer, AppBar, Toolbar, List, Typography, Divider, MenuItem, IconButton, Menu, useTheme, useMediaQuery, Avatar, Badge, withStyles, Chip, Tooltip, Switch } from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CachedIcon from "@material-ui/icons/Cached";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TaskIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import logo from "../assets/logo.png";
import logoDark from "../assets/logo-black.png";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
// import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "./themeContext";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";

// import { SocketContext } from "../context/Socket/SocketContext";

const backendUrl = getBackendUrl();

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary,
      border:
        theme.mode === "light"
          ? "1px solid rgba(0 124 102)"
          : "1px solid rgba(255, 255, 255, 0.5)",
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary,
    },
  },
  chip: {
    background: "red",
    color: "white",
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 24,
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  menuButtonHidden: {
    display: "none !important",
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
    color: "white",
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "hidden",
  },

  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  containerWithScroll: {
    flex: 1,
    overflowY: "scroll",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    borderRadius: "8px",
    border: "2px solid transparent",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "-ms-overflow-style": "none",
    "scrollbar-width": "none",
  },
  logo: {
    width: "100%",
    height: "45px",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "100%",
      maxWidth: 180,
    },
    logo: theme.logo,
    content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")"
  },
  hideLogo: {
    display: "none",
  },
  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #ccc",
  },
  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  warning: {
    display: 'inline-block',
    backgroundColor: '#f3f3f361',
    padding: '1px 10px',
    borderRadius: '10px',
    color: '#fff',
    marginLeft: '10px',
    border: '1px solid #fff',
    fontSize: '0.8rem',
  },
  danger: {
    display: 'inline-block',
    backgroundColor: 'rgb(229 53 53)',
    padding: '1px 10px',
    borderRadius: '7px',
    color: '#fff',
    marginLeft: '10px',
  },
  btnLogo: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    paddingLeft: '0',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  logoMenu: {
    width: '30px',
    height: 'auto',
  },
  iconMenu: {
    transition: 'linear 0.18s !important',
    fontSize: '2rem !important',
    color: '#fff',
    marginLeft: '-8px',
  },
  iconMenuHover: {
    transform: 'translateX(3px)',
  },
  profileMenuOpt: {
    marginLeft: "10px",
  },
  infoUsuario: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
    cursor: 'default',
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:focus": {
      backgroundColor: "transparent",
    },
  },
  avatarUsuario: {
    marginRight: 8,
  },
  itemMenuPerfil: {
    color: '#9CA1AA',
    margin: '5px 3px',
    '& .MuiSvgIcon-root': {
      color: '#757575',
      marginRight: 5,
    },
  },
  logoutItem: {
    color: "#ff5858",
    margin: "0px 8px 4px 8px",
    backgroundColor: "rgb(245 198 198 / 20%)",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "rgb(245 162 162 / 20%)",
    },
  },
  customSwitch: {
    "& .MuiSwitch-input": {
      left: "0",
      width: "40px",
      height: "40px",
    },
    "& .MuiSwitch-track": {
      borderRadius: 20,
    },
  },
  iconDarkMode: {
    position: "relative",
    top: "-2px",
    color: theme.mode === "dark" ? "white" : "inherit",
  },
  displayUsuario: {
    color: "#c7c7c7",
    fontSize: "0.8rem",
    fontStyle: "normal",
    marginTop: "-6px",
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const MenuItemLink = React.forwardRef((props, ref) => (
  <MenuItem
    ref={ref}
    component={RouterLink}
    onClick={props.onMenuClose}
    {...props}
  />
));

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userToken, setUserToken] = useState("disabled");
  const [loadingUserToken, setLoadingUserToken] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  // const [dueDate, setDueDate] = useState("");
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  useEffect(() => {
    console.error = () => { };
    const getSetting = async () => {
      try {
        const response = await settings.get("AASaaS");

        if (response) {
          setUserToken("disabled");
        } else {
          setUserToken("disabled");
        }
      } catch (error) {
        setUserToken("disabled");
      }
    };

    getSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    if (user && user.name) {
      const initials = user.name.charAt(0).toUpperCase();
      setUserInitials(initials);
    }
  }, [user]);

  useEffect(() => {
    // if (localStorage.getItem("public-token") === null) {
    //   handleLogout()
    // }

    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {

    const companyId = user.companyId;
    const userId = user.id;
    if (companyId) {
      //    const socket = socketManager.GetSocket();

      const ImageUrl = user.profileImage;

      if (ImageUrl !== undefined && ImageUrl !== null) {
        setProfileUrl(`${backendUrl}/public/company${companyId}/user/${ImageUrl}`);
      } else {
        const initials = user.name.charAt(0).toUpperCase();
        setUserInitials(initials);
      }

      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toastError("Sua conta foi acessada em outro computador.");
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1000);
        }
      }

      socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);

      socket.emit("userStatus");
      const interval = setInterval(() => {
        socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => {
        socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const today = new Date();
  const dueDate = new Date(user?.company?.dueDate);
  const timeDiff = dueDate - today;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const [iconHover, setIconHover] = React.useState(false);

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img className={drawerOpen ? classes.logo : classes.hideLogo}
            style={{
              margin: "0 auto",
              height: "36px",
              width: "auto",
            }}
            alt="logo" />
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          {/* {mainListItems} */}
          <MainListItems collapsed={!drawerOpen} />
        </List>
        <Divider />
      </Drawer>

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            className={clsx(classes.btnLogo, drawerOpen && classes.menuButtonHidden)}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="open drawer"
            onMouseEnter={() => setIconHover(true)}
            onMouseLeave={() => setIconHover(false)}
          >
            <img src="/mobile-logo-mini.svg" alt="" className={classes.logoMenu} />
            <ArrowRightRoundedIcon className={`${classes.iconMenu} ${iconHover ? classes.iconMenuHover : ''}`} />
          </IconButton>

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {i18n.t("mainDrawer.appBar.user.message")} <b style={{ fontSize: '1.1rem' }}>{user.name}</b>,{" "}
            {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
            <b>{user?.company?.name}</b>!

            {greaterThenSm && user?.profile === "admin" ? (
              <>
                {user?.company?.dueDate && (
                  <>
                    {daysRemaining <= 0 ? (
                      <Tooltip title="Não foi identificado o pagamento">
                        <div className={classes.danger}>
                          <b>Atenção:</b> Sistema suspenderá amanhã!
                        </div>
                      </Tooltip>
                    ) : daysRemaining <= 7 ? (
                      <Tooltip title="Necessário realizar o pagamento">
                        <div className={classes.warning}>
                          Sistema vence em <b>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</b>.
                        </div>
                      </Tooltip>
                    ) : null}
                  </>
                )}
              </>
            ) : null}
          </Typography>

          {userToken === "enabled" && user?.companyId === 1 && (
            <Chip
              className={classes.chip}
              label={i18n.t("mainDrawer.appBar.user.token")}
            />
          )}


          {/* DESABILITADO POIS TEM BUGS */}
          {/* <UserLanguageSelector /> */}
          {/* <SoftPhone
            callVolume={33} //Set Default callVolume
            ringVolume={44} //Set Default ringVolume
            connectOnStart={false} //Auto connect to sip
            notifications={false} //Show Browser Notification of an incoming call
            config={config} //Voip config
            setConnectOnStartToLocalStorage={setConnectOnStartToLocalStorage} // Callback function
            setNotifications={setNotifications} // Callback function
            setCallVolume={setCallVolume} // Callback function
            setRingVolume={setRingVolume} // Callback function
            timelocale={'UTC-3'} //Set time local for call history
          /> */}

          {/* <IconButton edge="start" onClick={colorMode.toggleColorMode}>
            {theme.mode === "dark" ? (
              <Brightness7Icon style={{ color: "white" }} />
            ) : (
              <Brightness4Icon style={{ color: "white" }} />
            )}
          </IconButton> */}

          <Tooltip title={theme.mode === "dark" ? "Modo Claro" : "Modo Escuro"} arrow>
            <Switch
              className={classes.customSwitch}
              checked={theme.mode === "dark"}
              onChange={colorMode.toggleColorMode}
              color="default"
              icon={<Brightness4Icon className={classes.iconDarkMode} />}
              checkedIcon={<Brightness7Icon className={classes.iconDarkMode} />}
            />
          </Tooltip>

          <Tooltip title="Volume" placement="bottom" arrow>
            <NotificationsVolume setVolume={setVolume} volume={volume} />
          </Tooltip>

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <CachedIcon style={{ color: "white" }} />
          </IconButton>

          {/* <DarkMode themeToggle={themeToggle} /> */}

          {user.id && <NotificationsPopOver volume={volume} />}

          <AnnouncementsPopover />

          <ChatPopover />

          <div className={classes.profileMenuOpt}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              onClick={handleMenu}
            >
              <Avatar
                alt="Avatar"
                className={classes.avatar2}
                src={profileUrl || undefined}
              >
                {profileUrl ? null : userInitials}
              </Avatar>
            </StyledBadge>

            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem className={classes.infoUsuario} disableRipple>
                <Avatar className={classes.avatarUsuario} src={profileUrl || undefined}>
                {profileUrl ? null : userInitials}
                </Avatar>
                <div>
                  <strong>{user.name}</strong>
                  <div className={classes.displayUsuario}>
                    {user?.profile === "admin" ? "Administrador" : "Usuário"}
                  </div>
                </div>
              </MenuItem>

              <Divider style={{ marginBottom: '10px' }} />

              <MenuItem onClick={handleOpenUserModal} className={classes.itemMenuPerfil}>
                <AccountCircleIcon />
                Perfil
              </MenuItem>

              <MenuItemLink className={classes.itemMenuPerfil} to="/todolist" style={{ textDecoration: 'none' }} onMenuClose={handleCloseMenu}>
                <TaskIcon />
                Anotações
              </MenuItemLink>
              {user?.profile === "admin" && (
                <MenuItemLink className={classes.itemMenuPerfil} to="/settings" style={{ textDecoration: 'none' }} onMenuClose={handleCloseMenu}>
                  <SettingsIcon />
                  Configurações
                </MenuItemLink>
              )}

              <Divider style={{ margin: '10px' }} />

              <MenuItem onClick={handleClickLogout} className={classes.logoutItem}>
                <ExitToAppIcon />
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>

          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
