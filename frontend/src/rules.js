const rules = {
	user: {
		static: [],
	},

	admin: {
		static: [
			"dashboard:view",
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"ticket-options:deleteTicket",
			"contacts-page:deleteContact",
			"contacts-page:deleteAllContacts",
			"connections-page:actionButtons",
			"connections-page:addConnection",
			"connections-page:editOrDeleteConnection",
			"tickets-manager:closeAll",
		],
	},
};

export default rules;
