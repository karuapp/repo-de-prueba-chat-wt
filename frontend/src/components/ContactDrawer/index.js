import React, { useEffect, useState, useContext } from "react";

import { ContactEmergency as ContactEmergencyIcon, KeyboardArrowRight as KeyboardArrowRightIcon, Close as CloseIcon, Mic, MicOff, Assistant, Block } from '@mui/icons-material';

import { CardHeader, Switch, makeStyles, Typography, IconButton, Drawer, Link, InputLabel, Button, Paper } from "@material-ui/core";

import formatSerializedId from '../../utils/formatSerializedId';
import { i18n } from "../../translate/i18n";
import ModalImageCors from "../ModalImageCors"
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import { ContactNotes } from "../ContactNotes";

import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import api from "../../services/api";
import { toast } from "react-toastify";
import { TagsKanbanContainer } from "../TagsKanbanContainer";

import './contactDrawer.css';
import clsx from 'clsx';


const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	switchInputCustom: {
		width: '300% !important',
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		backgroundColor: theme.palette.inputBackground,
		padding: theme.spacing(0, 1),
	},
	content: {
		backgroundColor: theme.palette.inputBackground,
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();

	const [modalOpen, setModalOpen] = useState(false);
	const [blockingContacts, setBlockingContacts] = useState({});
	const [openForm, setOpenForm] = useState(false);
	const { get } = useCompanySettings();
	const [hideNum, setHideNum] = useState(false);
	const { user } = useContext(AuthContext);
	const [acceptAudioMessage, setAcceptAudio] = useState(contact.acceptAudioMessage);

	useEffect(() => {
		async function fetchData() {

			const lgpdHideNumber = await get({
				"column": "lgpdHideNumber"
			});

			if (lgpdHideNumber === "enabled") setHideNum(true);

		}
		fetchData();
	}, [get])

	useEffect(() => {
		setOpenForm(false);
	}, [open, contact]);

	useEffect(() => {
		if (contact && contact.hasOwnProperty('acceptAudioMessage')) {
			setAcceptAudio(contact.acceptAudioMessage);
		}
	}, [contact]);

	useEffect(() => {
		if (contact) {
			setBlockingContacts(prevState => ({
				...prevState,
				[contact.id]: contact.active,
			}));
		}
	}, [contact]);

	useEffect(() => {
		async function fetchContactData() {
			try {
				if (contact && contact.id) {
					const response = await api.get(`/contacts/${contact.id}`);
					const updatedContact = response.data;
					setBlockingContacts(prevState => ({
						...prevState,
						[updatedContact.id]: updatedContact.active
					}));
				}
			} catch (err) {
				console.log('Erro ao buscar contato:', err);
			}
		}

		fetchContactData();
	}, [contact]);

	const handleContactToggleAcceptAudio = async () => {
		try {
			const contact = await api.put(`/contacts/toggleAcceptAudio/${ticket.contact.id}`);
			setAcceptAudio(contact.data.acceptAudioMessage);
		} catch (err) {
			console.log('Erro ao atualizar estado do áudio:', err);
		}
	};

	const handleBlockContact = async (contactId) => {
		try {
			await api.put(`/contacts/block/${contactId}`, { active: false });
			toast.success("Contato Bloqueado");

			setBlockingContacts(prevState => ({
				...prevState,
				[contactId]: false,
			}));
		} catch (err) {
			console.log('Erro ao bloquear contato:', err);
		}
	};

	const handleUnBlockContact = async (contactId) => {
		try {
			await api.put(`/contacts/block/${contactId}`, { active: true });
			toast.success("Contato Desbloqueado");

			setBlockingContacts(prevState => ({
				...prevState,
				[contactId]: true,
			}));
		} catch (err) {
			console.log('Erro ao desbloquear contato:', err);
		}
	};

	if (loading) return null;

	return (
		<>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<div className={clsx(classes.header, 'CDheaderContact')}>
					<IconButton onClick={handleDrawerClose}>
						<CloseIcon />
					</IconButton>
					<Typography style={{ justifySelf: "center" }}>
						{i18n.t("contactDrawer.header")}
					</Typography>
				</div>
				{loading ? (
					<ContactDrawerSkeleton classes={classes} />
				) : (
					<div className={clsx(classes.content, 'CDcontentContato')}>
						<Paper elevation={0} className="CDcontactHeader">
							<div className="CDimgProfile">
								<ModalImageCors imageUrl={contact?.urlPicture} />
							</div>
							<CardHeader
								titleTypographyProps={{ noWrap: true }}
								subheaderTypographyProps={{ noWrap: true }}
								className="CDnomeNumero"
								title={
									<>
										<Typography className="CDcontactName">
											{contact.name}
										</Typography>
									</>
								}
								subheader={
									<>
										<Typography style={{ fontSize: 15 }}>
											{hideNum && user.profile === "user" ? formatSerializedId(contact.number).slice(0, -6) + "**-**" + contact.number.slice(-2) : formatSerializedId(contact.number)}
										</Typography>
										<Typography style={{ color: "primary", fontSize: 15 }}>
											<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
										</Typography>
									</>
								}
							/>
							<Button
								variant="outlined"
								color="primary"
								onClick={() => setModalOpen(!openForm)}
								className="CDeditarContato"
								startIcon={<ContactEmergencyIcon />}
								endIcon={<KeyboardArrowRightIcon />}
							>
								<div id="CDbuttonEdit">{i18n.t("contactDrawer.buttons.edit")}</div>
							</Button>
							<Button
								variant="outlined"
								color="primary"
								className="CDeditarContatoAudio"
								startIcon={acceptAudioMessage ? <Mic /> : <MicOff />}
							>
								<div id="CDbuttonEditAudio">{i18n.t("ticketOptionsMenu.acceptAudioMessage")}</div>

								<Switch
									size="small"
									checked={acceptAudioMessage}
									onChange={handleContactToggleAcceptAudio}
									name="acceptAudioMessage"
									color="primary"
									key={contact.id}
									classes={{ input: classes.switchInputCustom }}
								/>
							</Button>
							<Button
								variant="outlined"
								color="primary"
								onClick={() => setModalOpen(!openForm)}
								className="CDeditarContatoChatbot"
								startIcon={<Assistant />}
								endIcon={<KeyboardArrowRightIcon />}
							>
								<div id="CDbuttonEditChatbot">{i18n.t("contactModal.form.chatBotContact")}</div>
							</Button>
							{(contact.id && openForm) && <ContactForm initialContact={contact} onCancel={() => setOpenForm(false)} />}
						</Paper>
						<TagsKanbanContainer ticket={ticket} />
						<Paper square variant="outlined" className="contactDetails">
							<ContactModal
								open={modalOpen}
								onClose={() => setModalOpen(false)}
								contactId={contact.id}
							/>
							<Typography variant="subtitle1">
								{i18n.t("contactDrawer.extraInfo")}
							</Typography>
							{contact?.extraInfo && contact.extraInfo.length > 0 ? (
								contact.extraInfo.map(info => (
									<Paper key={info.id} square variant="outlined" className="CDcontactExtraInfo">
										<div style={{ display: "flex", width: "100%" }}>
											<InputLabel className="CDinputInfoName">{info.name}</InputLabel>
											<Typography component="div" style={{ wordWrap: 'break-word', flex: 1, color: '#737373', padding: '5px 2px' }}>
												<MarkdownWrapper>{info.value}</MarkdownWrapper>
											</Typography>
										</div>
									</Paper>
								))
							) : (
								<div className="CDinfoExtra">
									<Typography variant="body1">
										{i18n.t("contactDrawer.phExtraInfoA")}{" "}
										<span
											onClick={() => setModalOpen(!openForm)}
										>
											{i18n.t("contactDrawer.phExtraInfoB")}
										</span>
									</Typography>
								</div>
							)}
						</Paper>

						<Paper square variant="outlined" className="contactDetails">
							<Typography variant="subtitle1" style={{ marginBottom: 10 }}>
								{i18n.t("ticketOptionsMenu.appointmentsModal.title")}
							</Typography>
							<ContactNotes ticket={ticket} />
						</Paper>
						<Button
							variant="outlined"
							color="secondary"
							onClick={() =>
								blockingContacts[contact.id]
									? handleBlockContact(contact.id)
									: handleUnBlockContact(contact.id)
							}
							disabled={loading}
							className="CDblockContact"
							startIcon={<Block className="CDblockIcon" />}
						>
							{blockingContacts[contact.id]
								? `Bloquear ${contact.name.split(' ')[0].charAt(0).toUpperCase() + contact.name.split(' ')[0].slice(1)}`
								: `Desbloquear ${contact.name.split(' ')[0].charAt(0).toUpperCase() + contact.name.split(' ')[0].slice(1)}`}
						</Button>
					</div>
				)}
			</Drawer>
		</>
	);
};

export default ContactDrawer;
