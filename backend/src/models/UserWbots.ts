import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class UserWbots extends Model<UserWbots> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  wbotId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserWbots;
