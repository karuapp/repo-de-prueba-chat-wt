import React, { useState, useContext, useRef   } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import EditMessageModal from "../EditMessageModal";
import ForwardMessageModal from "../ForwardMessageModal";
import toastError from "../../errors/toastError";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [confirmationEditOpen, setEditMessageOpenModal] = useState(false);
	const [messageEdit, setMessageEdit] = useState(false);
	const [forwardMessageModalOpen, setForwardMessageModalOpen] = useState(false);
	const isMounted = useRef(true);

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleEditMessage = async () => {
		try {
			await api.put(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	}

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};


	const handleCloseForwardMessageModal = () => {
		if (isMounted.current) {
			setForwardMessageModalOpen(false);
		}
	};

	const handleForwardMessage = () => {
		setForwardMessageModalOpen(true)
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleOpenEditMessageModal = e => {
		setEditMessageOpenModal(true);
		setMessageEdit(message)
		handleClose();
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<EditMessageModal
				title={i18n.t("messageOptionsMenu.editMessageModal.title")}
				open={confirmationEditOpen}
				onClose={setEditMessageOpenModal}
				onSave={handleEditMessage}
				message={message}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</EditMessageModal>
			<ForwardMessageModal
				modalOpen={forwardMessageModalOpen}
				onClose={handleCloseForwardMessageModal}
				message={message}
			/>
			<Menu
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
				onClose={handleClose}
			>
				{message.fromMe && (
					<MenuItem onClick={handleOpenEditMessageModal}>
						{i18n.t("messageOptionsMenu.edit")}
					</MenuItem>
				)}
				<MenuItem onClick={() => handleForwardMessage()}>
					{i18n.t("messageOptionsMenu.toForward")}
				</MenuItem>
				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
				<MenuItem onClick={hanldeReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
