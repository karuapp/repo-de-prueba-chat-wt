import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import { Op } from 'sequelize';
import Contact from "../models/Contact";
import Tag from "../models/Tag";
import Ticket from "../models/Ticket";
import Queue from "../models/Queue";
import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import GetContactService from "../services/ContactServices/GetContactService";

import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import AppError from "../errors/AppError";
import SimpleListService, {
  SearchContactParams
} from "../services/ContactServices/SimpleListService";
import ContactCustomField from "../models/ContactCustomField";
import ToggleAcceptAudioContactService from "../services/ContactServices/ToggleAcceptAudioContactService";
import BlockUnblockContactService from "../services/ContactServices/BlockUnblockContactService";
import { ImportContactsService } from "../services/ContactServices/ImportContactsService";
import { createObjectCsvWriter } from 'csv-writer';
import fs from "fs";
import path from 'path';


type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  queueIds: string;
  tags: string;
};


export const baixar = async (req: Request, res: Response): Promise<void> => {
  const {
    queueIds: queueIdsStringified,
    tags: tagIdsStringified
  } = req.query;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified as string);
  }

  if (tagIdsStringified) {
    tagIds = JSON.parse(tagIdsStringified as string);
  }

  console.log(queueIds);
  console.log(tagIds);
  console.log(companyId);

  try {
    let contacts: Contact[] = [];

    if (queueIds.length > 0 || tagIds.length > 0) {
      const ticketWhere: any = {};

      if (queueIds.length > 0) {
        ticketWhere.queueId = queueIds;
      }

      if (tagIds.length > 0) {
        ticketWhere['$tags.id$'] = tagIds;
      }

      const tickets = await Ticket.findAll({
        where: ticketWhere,
        include: [
          {
            model: Queue,
            attributes: ['name']
          },
          {
            model: Tag,
            attributes: ['name']
          }
        ],
        attributes: ['id'],
        raw: true
      });

      const ticketIds = tickets.map((ticket: any) => ticket.id);

      contacts = await Contact.findAll({
        include: [
          {
            model: Ticket,
            include: [
              {
                model: Queue,
                attributes: ['name']
              },
              {
                model: Tag,
                attributes: ['name']
              }
            ],
            where: {
              id: ticketIds
            },
            required: true
          }
        ],
        attributes: ['name', 'email', 'number'],
        where: {
          companyId: companyId
        }
      });
    } else {
      contacts = await Contact.findAll({
        include: [
          {
            model: Ticket,
            include: [
              {
                model: Queue,
                attributes: ['name']
              },
              {
                model: Tag,
                attributes: ['name']
              }
            ],
            required: false
          }
        ],
        attributes: ['name', 'email', 'number'],
        where: {
          companyId: companyId
        }
      });
    }

const formattedContacts = contacts.map((contact) => {
  const formattedTags = contact.tickets.flatMap((ticket) =>
    ticket.tags.map((tag) => tag.name)
  );

  const formattedQueue = contact.tickets[0]?.queue?.name || '';


  return {
    name: contact.name,
    email: contact.email,
    number: contact.number,
    tags: formattedTags.join(' | '), // Convert tags to a comma-separated string
    queue: formattedQueue// Convert queues to a comma-separated string
  };
});

    const filename = `export_contacts_${new Date().getTime()}.csv`;
    const folder = `public/company${companyId}`;
    const filePath = path.join(folder, filename);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'number', title: 'Number' },
        { id: 'tags', title: 'Tags' },
        { id: 'queue', title: 'Queue' }
      ]
    });

    await csvWriter.writeRecords(formattedContacts);


    // Stream the CSV file as the response
  
    console.log(filePath);
  
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
	res.setHeader('Content-Type', 'text/csv');

	// Create a response object with the filePath
	const response = {
  		filePath: filePath
	};

	// Send the response object as JSON
	res.status(200).json(response);

  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ message: 'Failed to export contacts' });
  }
};