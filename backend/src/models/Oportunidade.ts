import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "Oportunidades"
})
class Oportunidade extends Model<Oportunidade> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  name: string;

  @Column
  funil: string;

  @Column
  ticketInfo: string;

  @Column
  ticketId: number;

  @Column
  tagId: number;

  @Column
  etapadofunil: string;

  @Column
  fonte: string;

  @Column
  campanha: string;

  @Column
  datadeida: string;

  @Column
  datadevolta: string;

  @Column
  origem: string;

  @Column
  destino: string;

  @Column
  valor: string;

  @Column
  produto: string;

  @Column
  userId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Oportunidade;
