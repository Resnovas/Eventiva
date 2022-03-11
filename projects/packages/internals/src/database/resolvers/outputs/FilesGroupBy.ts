import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCountAggregate } from "../outputs/FilesCountAggregate";
import { FilesMaxAggregate } from "../outputs/FilesMaxAggregate";
import { FilesMinAggregate } from "../outputs/FilesMinAggregate";

@TypeGraphQL.ObjectType("FilesGroupBy", {
  isAbstract: true
})
export class FilesGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  rtwId!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted!: Date | null;

  @TypeGraphQL.Field(_type => FilesCountAggregate, {
    nullable: true
  })
  _count!: FilesCountAggregate | null;

  @TypeGraphQL.Field(_type => FilesMinAggregate, {
    nullable: true
  })
  _min!: FilesMinAggregate | null;

  @TypeGraphQL.Field(_type => FilesMaxAggregate, {
    nullable: true
  })
  _max!: FilesMaxAggregate | null;
}
