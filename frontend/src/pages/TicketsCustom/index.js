import React, { useState, useCallback, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Paper, Hidden, makeStyles } from "@material-ui/core";

import TicketsManager from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import PWAInstallPrompt from "../../components/PWAInstallPrompt";

import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

import './ticketCustom.css';
import atevusNoticket from '../../assets/atevusMacbook.png';

const defaultTicketsManagerWidth = 550;
const minTicketsManagerWidth = 404;
const maxTicketsManagerWidth = 700;

const useStyles = makeStyles((theme) => ({
	welcomeMsg: {
		background: theme.palette.tabHeaderBackground,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	dragger: {
		width: "5px",
		cursor: "ew-resize",
		padding: "4px 0 0",
		borderTop: "1px solid #ddd",
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 100,
		backgroundColor: "#f4f7f9",
		userSelect: "none",
	},
	ntSegurancaTKC: {
		'--corInfoCadeado': theme.mode === 'light' ? '#8696a0' : '#8d8e8f',
	}
}));

const TicketsCustom = () => {
	const { user } = useContext(AuthContext);
	const classes = useStyles();
	const { ticketId } = useParams();

	const [ticketsManagerWidth, setTicketsManagerWidth] = useState(0);
	const ticketsManagerWidthRef = useRef(ticketsManagerWidth);

	useEffect(() => {
		if (user && user.defaultTicketsManagerWidth) {
			setTicketsManagerWidth(user.defaultTicketsManagerWidth);
		}
	}, [user]);

	const handleMouseDown = (e) => {
		document.addEventListener("mouseup", handleMouseUp, true);
		document.addEventListener("mousemove", handleMouseMove, true);
	};

	const handleSaveContact = async value => {
		if (value < 404) value = 404;
		await api.put(`/users/toggleChangeWidht/${user.id}`, { defaultTicketsManagerWidth: value });
	};

	const handleMouseMove = useCallback(
		(e) => {
			const newWidth = e.clientX - document.body.offsetLeft;
			if (
				newWidth > minTicketsManagerWidth &&
				newWidth < maxTicketsManagerWidth
			) {
				ticketsManagerWidthRef.current = newWidth;
				setTicketsManagerWidth(newWidth);
			}
		},
		[]
	);

	const handleMouseUp = async () => {
		document.removeEventListener("mouseup", handleMouseUp, true);
		document.removeEventListener("mousemove", handleMouseMove, true);

		const newWidth = ticketsManagerWidthRef.current;

		if (newWidth !== ticketsManagerWidth) {
			await handleSaveContact(newWidth);
		}
	};

	return (
		<QueueSelectedProvider>
			<div className="chatContainerTKC">
				<div className="chatPapperTKC">
					<div
						className="contactsWrapperTKC"
						style={{ width: ticketsManagerWidth }}
					>
						<TicketsManager />
						<div onMouseDown={handleMouseDown} className={classes.dragger} />
					</div>
					<div className="messagesWrapperTKC">
						{ticketId ? (
							<Ticket />
						) : (
							<Hidden only={["sm", "xs"]}>
								<Paper square variant="outlined" className={classes.welcomeMsg}>
									<div className="ntDiv">
										<center>
											<img src={atevusNoticket} width="280" alt="" />
											<PWAInstallPrompt />
											<span className={`ntSeguranca ${classes.ntSegurancaTKC}`}>
												<svg viewBox="0 0 10 12" height="16" width="14" className="svgCadeadoTicket" preserveAspectRatio="xMidYMid meet" version="1.1">
													<title>lock-small</title>
													<path d="M5.00847986,1.6 C6.38255462,1.6 7.50937014,2.67435859 7.5940156,4.02703389 L7.59911976,4.1906399 L7.599,5.462 L7.75719976,5.46214385 C8.34167974,5.46214385 8.81591972,5.94158383 8.81591972,6.53126381 L8.81591972,9.8834238 C8.81591972,10.4731038 8.34167974,10.9525438 7.75719976,10.9525438 L2.25767996,10.9525438 C1.67527998,10.9525438 1.2,10.4731038 1.2,9.8834238 L1.2,6.53126381 C1.2,5.94158383 1.67423998,5.46214385 2.25767996,5.46214385 L2.416,5.462 L2.41679995,4.1906399 C2.41679995,2.81636129 3.49135449,1.68973395 4.84478101,1.60510326 L5.00847986,1.6 Z M5.00847986,2.84799995 C4.31163824,2.84799995 3.73624912,3.38200845 3.6709675,4.06160439 L3.6647999,4.1906399 L3.663,5.462 L6.35,5.462 L6.35111981,4.1906399 C6.35111981,3.53817142 5.88169076,2.99180999 5.26310845,2.87228506 L5.13749818,2.85416626 L5.00847986,2.84799995 Z" fill="currentColor"></path>
												</svg>
												Suas mensagens pessoais são protegidas com a criptografia de ponta a ponta.
											</span>
										</center>
									</div>
								</Paper>
							</Hidden>
						)}
					</div>
				</div>
			</div>
		</QueueSelectedProvider>
	);
};

export default TicketsCustom;