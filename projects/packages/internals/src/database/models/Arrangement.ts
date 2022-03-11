import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { ArrangementOfRoom } from "../models/ArrangementOfRoom";
import { ArrangementCount } from "../resolvers/outputs/ArrangementCount";

@TypeGraphQL.ObjectType("Arrangement", {
  isAbstract: true
})
export class Arrangement {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  room?: ArrangementOfRoom[];

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  icon?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details?: string | null;

  @TypeGraphQL.Field(_type => ArrangementCount, {
    nullable: true
  })
  _count?: ArrangementCount | null;
}
