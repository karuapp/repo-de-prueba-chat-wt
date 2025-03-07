import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  BelongsTo,
  DataType,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";


@Table
class Groups extends Model<Groups> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(null)
  @Column
  jid: string;

  @Default(null)
  @Column
  subject: string;

  @Default(null)
  @Column
  participants: string;

  @Column({
    type: DataType.JSONB
  })
  participantsJson: [];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

}

export default Groups;
