import React, { useState, createContext, useEffect } from "react";

const ForwardMessageContext = createContext();

const ForwardMessageProvider = ({ children }) => {
	const [showSelectMessageCheckbox, setShowSelectMessageCheckbox] = useState(false);
	const [selectedMessages, setSelectedMessages] = useState([]);
	const [forwardMessageModalOpen, setForwardMessageModalOpen] = useState(false);

	// Função para alternar o estado de showSelectMessageCheckbox
	const toggleCheckboxVisibility = () => {
		setShowSelectMessageCheckbox((prevState) => !prevState);
	};

	// UseEffect para capturar o evento de tecla ESC
	useEffect(() => {
		const handleEscapeKey = (event) => {
			if (event.key === 'Escape') {
				toggleCheckboxVisibility(); // Alterna a visibilidade dos checkboxes
			}
		};

		// Adiciona o event listener para escutar a tecla ESC
		window.addEventListener('keydown', handleEscapeKey);

		// Limpeza do event listener quando o componente for desmontado
		return () => {
			window.removeEventListener('keydown', handleEscapeKey);
		};
	}, []);

	return (
		<ForwardMessageContext.Provider
			value={{
				showSelectMessageCheckbox, 
				setShowSelectMessageCheckbox,
				selectedMessages, 
				setSelectedMessages,
				forwardMessageModalOpen, 
				setForwardMessageModalOpen,
				toggleCheckboxVisibility,
			}}
		>
			{children}
		</ForwardMessageContext.Provider>
	);
};

export { ForwardMessageContext, ForwardMessageProvider };
