/*import { Op, fn, where, col, Filterable, Includeable,  Sequelize } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import TicketTraking from "../../models/TicketTraking";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
  whatsappIds?: number[];
  statusFilters?: string[];
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId,
  whatsappIds,
  statusFilters
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    status: "pending",
    queueId: { [Op.or]: [queueIds, null] }
  };
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage"],
      include: ["extraInfo"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
  ];

  const user = await ShowUserService(userId);
  const userQueueIds = user.queues.map(queue => queue.id);


  if (user.profile === "user" && (status === "open" || status === "pending")) {
    whereCondition = {
      ...whereCondition,
      userId
    };
  }

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  //console.log(status);
  //console.log(statusFilters);

  if(status === "open"){
  
    whereCondition = {
  		...whereCondition,
    	isGroup: false
    };
  
  }

  if(status === "groups"){
  
  	status = "open";
  
    whereCondition = {
  		...whereCondition,
    	isGroup: true
    };
  
  }

  

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (updatedAt) {
    whereCondition = {
      updatedAt: {
        [Op.between]: [
          +startOfDay(parseISO(updatedAt)),
          +endOfDay(parseISO(updatedAt))
        ]
      }
    };
  }

  if (withUnreadMessages === "true") {
    
    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

    //console.log(whereCondition);
    //console.log(tags);


    if (searchParam || tags.length > 0 || users.length > 0 || whatsappIds.length > 0 || statusFilters.length > 0) {
    whereCondition = {
      queueId: { [Op.in]: queueIds },
      userId 
    };

    if (showAll === "true") {
      whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
    }

    if (searchParam) {
      const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

      includeCondition = [
        ...includeCondition,
        {
          model: Message,
          as: "messages",
          attributes: ["id", "body"],
          where: {
            body: where(
              fn("LOWER", col("body")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          required: false,
          duplicating: false
        }
      ];

      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          {
            "$contact.name$": where(
              fn("LOWER", col("contact.name")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
          {
            "$message.body$": where(
              fn("LOWER", col("body")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          }
        ]
      };
    }

    if (status === "closed") {
      const maxTicketsFilter: any[] | null = [];
      const maxTicketIds = await Ticket.findAll({
        where: {       
          queueId: { [Op.or]: [userQueueIds, null] }
        },
        group: ['companyId','contactId','queueId', 'whatsappId'],
        attributes: ['companyId','contactId','queueId', 'whatsappId', [Sequelize.fn('max', Sequelize.col('id')), 'id']],
      });
      if (maxTicketIds) {
        //maxTicketsFilter.push(maxTicketIds.map(t => t.id));
        maxTicketsFilter.push(maxTicketIds.map(t => t.id));
      }
      // }
  
      const contactsIntersection: number[] = intersection(...maxTicketsFilter);
  
      whereCondition = {
        ...whereCondition,
        id: {
          [Op.in]: contactsIntersection
        }
      };
    }

  if (Array.isArray(tags) && tags.length > 0) {
    const ticketsTagFilter: any[] | null = [];
    for (let tag of tags) {
      const ticketTags = await TicketTag.findAll({
        where: { tagId: tag }
      });
      if (ticketTags) {
        ticketsTagFilter.push(ticketTags.map(t => t.ticketId));
      }
    }

    const ticketsIntersection: number[] = intersection(...ticketsTagFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: ticketsIntersection
      }
    };
  }
    
    if (Array.isArray(users) && users.length > 0) {
      
      whereCondition = {
        ...whereCondition,
        userId: {[Op.in]:users}
      };
    }

    
    if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
      
      whereCondition = {
        ...whereCondition,
        whatsappId: {[Op.in]:whatsappIds}
      };
    }

    
    /*
    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      
      whereCondition = {
        ...whereCondition,
        status: {[Op.in]:statusFilters}
      };
    }
    *//////////////////////
/*
    if (Array.isArray(statusFilters) && statusFilters.length > 0) {

  		if (statusFilters.includes('open') || statusFilters.includes('close')) {
    		whereCondition = {
        		...whereCondition,
        		status: {[Op.in]:statusFilters}
      		};
  		}

  		if (statusFilters.includes('group')) {
    		whereCondition = {
        		...whereCondition,
        		isGroup: true
      		};
  		}
	}
    
    
  }
 
  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  whereCondition = {
    ...whereCondition,
    companyId
  };

  //console.log(includeCondition);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
*/
import { Op, fn, where, col, Filterable, Includeable,  QueryTypes } from "sequelize";
import sequelize from "../../database";

import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";


interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
  whatsappIds?: number[];
  statusFilters?: string[];
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId,
  whatsappIds,
  statusFilters
}: Request): Promise<Response> => {

  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.in]: queueIds }
  };

  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage"],
      include: ["extraInfo"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
  ];

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  
  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }
 
  if (updatedAt) {
    whereCondition = {
      updatedAt: {
        [Op.between]: [
          +startOfDay(parseISO(updatedAt)),
          +endOfDay(parseISO(updatedAt))
        ]
      }
    };
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  if (searchParam || tags.length > 0 || users.length > 0 || whatsappIds.length > 0 || statusFilters.length > 0) {
    whereCondition = {
      queueId: { [Op.in]: queueIds },
      userId 
    };

    if (showAll === "true") {
      whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
    }

    if (searchParam) {
      const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

      includeCondition = [
        ...includeCondition,
        {
          model: Message,
          as: "messages",
          attributes: ["id", "body"],
          where: {
            body: where(
              fn("LOWER", col("body")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          required: false,
          duplicating: false
        }
      ];

      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          {
            "$contact.name$": where(
              fn("LOWER", col("contact.name")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
          {
            "$message.body$": where(
              fn("LOWER", col("body")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          }
        ]
      };
    }

    if (Array.isArray(tags) && tags.length > 0) {
      const ticketsTagFilter: any[] | null = [];
      // for (let tag of tags) {
      const ticketTags = await TicketTag.findAll({
        where: { tagId: { [Op.in]: tags } }
      });
      if (ticketTags) {
       ticketsTagFilter.push(ticketTags.map(t => t.ticketId));
      }
      // }

      const ticketsIntersection: number[] = intersection(...ticketsTagFilter);

      whereCondition = {
        ...whereCondition,
        id: {
          [Op.in]: ticketsIntersection
        }
      };
    }
  

    
    if (Array.isArray(users) && users.length > 0) {
      // const ticketsUserFilter: any[] | null = [];
      // // for (let user of users) {
      //   const ticketUsers = await Ticket.findAll({
      //     where: { userId: {[Op.in]:users} }
      //   });
      //   if (ticketUsers) {
      //     ticketsUserFilter.push(ticketUsers.map(t => t.id));
      //   }
      // // }

      // const ticketsIntersection: number[] = intersection(...ticketsUserFilter);

      whereCondition = {
        ...whereCondition,
        userId: {[Op.in]:users}
      };
    }

    
    if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
      // const ticketsWhatsappsrFilter: any[]  = [];
      // // for (let whatsappId of whatsappIds) {
    
      //   const ticketWhatsapps = await Ticket.findAll({
      //     where: { whatsappId: {[Op.in]:whatsappIds} }
      //   });
    
      //   if (ticketWhatsapps) {
      //     ticketsWhatsappsrFilter.push(ticketWhatsapps.map(t => t.id));
      //   }
      // // }

      // const ticketsIntersection: number[] = intersection(...ticketsWhatsappsrFilter);
      
      whereCondition = {
        ...whereCondition,
        whatsappId: {[Op.in]:whatsappIds}
      };
    }

    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      // const ticketStatusFilter: any[]  = [];
      // // for (let statusFilter of statusFilters) {
      //   const ticketStatus = await Ticket.findAll({
      //     where: { status: {[Op.in]:statusFilters}}
      //   });
    
      //   if (ticketStatus) {
      //     ticketStatusFilter.push(ticketStatus.map(t => t.id));
      //   }
      
      // // }

      // const ticketsIntersection: number[] = intersection(...ticketStatusFilter);
      
      whereCondition = {
        ...whereCondition,
        status: {[Op.in]:statusFilters}
      };
    }
    console.log(whereCondition)
  }
 
  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;