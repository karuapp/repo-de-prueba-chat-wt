import { Request, Response } from 'express';
import WhatsappQueue from '../models/WhatsappQueue';

class CheckQueuesController {
  public async getWhatsappIds(req: Request, res: Response): Promise<void> {
    try {
      const { queueId } = req.params;

      // Find all WhatsappQueue entries with the provided queueId
      const whatsappQueueEntries = await WhatsappQueue.findAll({
        where: { queueId: Number(queueId) },
      });

      // Extract the whatsappId values from the entries
      const whatsappIds = whatsappQueueEntries.map(
        (entry) => entry.whatsappId
      );

      // Return the whatsappIds as a JSON array
      res.json({ whatsappIds });
    } catch (error) {
      console.error('Error retrieving WhatsappIds:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new CheckQueuesController();