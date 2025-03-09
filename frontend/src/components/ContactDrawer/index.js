import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import CreateIcon from '@material-ui/icons/Create';

import { i18n } from "../../translate/i18n";

import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { CardHeader, MenuItem } from "@material-ui/core";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import { ContactNotes } from "../ContactNotes";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";


const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
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
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.background.default,
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.background.paper,
		flexDirection: "column",
		padding: "8px 0px 8px 8px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

	contactAvatar: {
		margin: 15,
		width: 100,
		height: 100,
	},

	contactHeader: {
		display: "flex",
		padding: 8,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		"& > *": {
			margin: 4,
		},
	},

	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
	},
	contactExtraInfo: {
		marginTop: 4,
		padding: 6,
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();

	const [modalOpen, setModalOpen] = useState(false);
	const [openForm, setOpenForm] = useState(false);
	const [membersGroup, setMembersGroup] = useState([]);
	const { user } = useContext(AuthContext)

	useEffect(() => {
		setOpenForm(false);
		setMembersGroup([])
	}, [open, contact]);


	useEffect(() => {
	}, [membersGroup]);

	const handleRenderMembersGroup = async (contactNumber, whatsappId) => {

		try {
			const { data } = await api.get(`/listMembersgroup/${contactNumber}/${whatsappId}`);

			setMembersGroup(data)

			console.log(data)
		} catch (error) {

		}
	}

	const handleRemoveMember = async (contactGroup, contactMember, whatsappId) => {
		try {
			const { data } = await api.put(`removeMemberGroup`, {
				contactGroup,
				contactMember,
				whatsappId
			})

			console.log('data.jid', data)

			const filterMembersGroup = membersGroup.filter(member => member.id !== data[0].jid);
			setMembersGroup(filterMembersGroup);
		} catch (error) {

		}
	}

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
				<div className={classes.header}>
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
					<div className={classes.content}>
						<Paper square variant="outlined" className={classes.contactHeader}>
							<CardHeader
								onClick={() => { }}
								style={{ cursor: "pointer", width: '100%' }}
								titleTypographyProps={{ noWrap: true }}
								subheaderTypographyProps={{ noWrap: true }}
								avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" style={{ width: 60, height: 60 }} />}
								title={
									<>
										<Typography onClick={() => setOpenForm(true)}>
											{contact.name}
											<CreateIcon style={{ fontSize: 16, marginLeft: 5 }} />
										</Typography>
									</>
								}
								subheader={
									<>
										<Typography style={{ fontSize: 12 }}>
											<Link href={`tel:${contact.number}`}>{contact.number}</Link>
										</Typography>
										<Typography style={{ fontSize: 12 }}>
											<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
										</Typography>
									</>
								}
							/>
							<Button
								variant="outlined"
								color="primary"
								onClick={() => setModalOpen(!openForm)}
								style={{ fontSize: 12 }}
							>
								{i18n.t("contactDrawer.buttons.edit")}
							</Button>
							{(contact.id && openForm) && <ContactForm initialContact={contact} onCancel={() => setOpenForm(false)} />}
						</Paper>
						<Paper square variant="outlined" className={classes.contactDetails}>
							<Typography variant="subtitle1" style={{ marginBottom: 10 }}>
								{i18n.t("ticketOptionsMenu.appointmentsModal.title")}
							</Typography>
							<ContactNotes ticket={ticket} />
						</Paper>
						{(user.profile === 'admin' || user.profile === 'supervisor') && (
							<>
								{ticket.isGroup && (
									<Paper square variant="outlined" className={classes.contactDetails}>
										<Typography variant="subtitle1" style={{ marginBottom: 10, alignItems: 'center' }}>
											{i18n.t("Membros do Grupo")}
										</Typography>

										<Button
											onClick={() => {
												handleRenderMembersGroup(ticket.contact.number, ticket.whatsappId);
											}}
											color='primary'
											variant="outlined"
										>
											{i18n.t("Listar membros do grupo")}
										</Button>
									</Paper>
								)}

								{ticket.isGroup && membersGroup.length > 0 && ( // Renderiza o menu se membersGroup contiver dados
									<Paper square variant="outlined" className={classes.contactDetails}>
										<Typography variant="subtitle1" style={{ marginBottom: 10, alignItems: 'center' }}>
											{i18n.t("Membros do Grupo")}
										</Typography>
										<div>
											{membersGroup.map(member => (
												<div key={member.id} style={{ display: 'flex', alignItems: 'center' }}>
													<MenuItem>
														{member.id.replace('@s.whatsapp.net', '')} - {member.admin ? 'Admin' : 'Membro'}
													</MenuItem>
													{member.admin ? null : (
														<Button
															variant="text"
															color="secondary"
															size="small"
															style={{ marginRight: 8 }}
															onClick={() => {
																handleRemoveMember(ticket.contact.number, member.id, ticket.whatsappId)
															}}
														>
															Remover
														</Button>
													)}
												</div>
											))}
										</div>
									</Paper>
								)}
							</>
						)}
						<Paper square variant="outlined" className={classes.contactDetails}>
							<ContactModal
								open={modalOpen}
								onClose={() => setModalOpen(false)}
								contactId={contact.id}
							></ContactModal>
							<Typography variant="subtitle1">
								{i18n.t("contactDrawer.extraInfo")}
							</Typography>
							{contact?.extraInfo?.map(info => (
								<Paper
									key={info.id}
									square
									variant="outlined"
									className={classes.contactExtraInfo}
								>
									<InputLabel>{info.name}</InputLabel>
									<Typography component="div" noWrap style={{ paddingTop: 2 }}>
										<MarkdownWrapper>{info.value}</MarkdownWrapper>
									</Typography>
								</Paper>
							))}
						</Paper>
					</div>
				)}
			</Drawer>
		</>
	);
};

export default ContactDrawer;
