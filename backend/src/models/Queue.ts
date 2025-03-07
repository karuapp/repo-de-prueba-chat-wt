import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
  HasMany,
  DataType,
  Default
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";
import Company from "./Company";

import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";
import QueueOption from "./QueueOption";

@Table
class Queue extends Model<Queue> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  color: string;

  @AllowNull(false)
  @Column
  isChatbot: boolean;

  @AllowNull(false)
  @Column
  prioridade: number;

  @AllowNull(false)
  @Column
  ativarRoteador: boolean;

  @AllowNull(false)
  @Column
  tempoRoteador: number;

  @Default("")
  @Column
  greetingMessage: string;

  @Default("")
  @Column
  outOfHoursMessage: string;

  @Column({
    type: DataType.JSONB
  })
  schedules: [];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>;

  @BelongsToMany(() => User, () => UserQueue)
  users: Array<User & { UserQueue: UserQueue }>;

  @HasMany(() => QueueOption, {
    onDelete: "DELETE",
    onUpdate: "DELETE",
    hooks: true
  })
  options: QueueOption[];

  @Default("")
  @Column
  typeChatbot: string;

  @Column
  workspaceTypebot: string;

  @Column
  typebotId: string;

  @Column
  publicId: string;

  @Default(true)
  @Column
  resetChatbotMsg: boolean;

  @Column
  n8n: string;

  @Column
  n8nId: string;

  @Column
  transbordoQueueId: number;

  @Column
  timeTransbordo: number;

  @Default("")
  @Column
  messageTransbordo: string;

}

export default Queue;
